from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app.database import engine, get_db, Base
from app.models import User, FlashcardSet, Flashcard
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    FlashcardSetCreate, FlashcardSetResponse,
    FlashcardCreate, FlashcardUpdate, FlashcardResponse,
    ProgressUpdate, ProgressResponse
)
from app.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Memora API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/api/auth/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "success": True,
        "user": {"id": new_user.user_id, "email": new_user.email, "name": new_user.email.split("@")[0]},
        "token": access_token
    }

@app.post("/api/auth/login", response_model=dict)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "success": True,
        "user": {"id": db_user.user_id, "email": db_user.email, "name": db_user.email.split("@")[0]},
        "token": access_token
    }

# Flashcard Set endpoints
@app.get("/api/sets", response_model=List[FlashcardSetResponse])
def get_sets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sets = db.query(FlashcardSet).filter(FlashcardSet.user_id == current_user.user_id).all()
    
    # Add card count to each set
    result = []
    for s in sets:
        card_count = db.query(Flashcard).filter(Flashcard.set_id == s.set_id).count()
        set_dict = {
            "set_id": s.set_id,
            "title": s.title,
            "description": s.description,
            "created_at": s.created_at,
            "card_count": card_count
        }
        result.append(set_dict)
    
    return result

@app.post("/api/sets", response_model=FlashcardSetResponse)
def create_set(
    flashcard_set: FlashcardSetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_set = FlashcardSet(
        user_id=current_user.user_id,
        title=flashcard_set.title,
        description=flashcard_set.description
    )
    db.add(new_set)
    db.commit()
    db.refresh(new_set)
    
    return {
        "set_id": new_set.set_id,
        "title": new_set.title,
        "description": new_set.description,
        "created_at": new_set.created_at,
        "card_count": 0
    }

# Flashcard endpoints
@app.get("/api/sets/{set_id}/cards", response_model=List[FlashcardResponse])
def get_cards(
    set_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user owns this set
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    cards = db.query(Flashcard).filter(Flashcard.set_id == set_id).all()
    return cards

@app.post("/api/sets/{set_id}/cards", response_model=FlashcardResponse)
def create_card(
    set_id: int,
    card: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user owns this set
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    new_card = Flashcard(
        set_id=set_id,
        front_text=card.front_text,
        back_text=card.back_text,
        category=card.category,
        order_number=card.order_number,
        position_x=card.position_x,
        position_y=card.position_y
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return new_card

@app.put("/api/cards/{card_id}", response_model=FlashcardResponse)
def update_card(
    card_id: int,
    card_update: FlashcardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(Flashcard.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Verify user owns this card's set
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    if card_update.front_text is not None:
        card.front_text = card_update.front_text
    if card_update.back_text is not None:
        card.back_text = card_update.back_text
    if card_update.category is not None:
        card.category = card_update.category
    if card_update.order_number is not None:
        card.order_number = card_update.order_number
    if card_update.position_x is not None:
        card.position_x = card_update.position_x
    if card_update.position_y is not None:
        card.position_y = card_update.position_y
    
    db.commit()
    db.refresh(card)
    
    return card

@app.delete("/api/cards/{card_id}")
def delete_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(Flashcard.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Verify user owns this card's set
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(card)
    db.commit()
    
    return {"success": True}

# Progress endpoints
@app.get("/api/progress/{set_id}", response_model=ProgressResponse)
def get_progress(
    set_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all cards in set
    cards = db.query(Flashcard).filter(Flashcard.set_id == set_id).all()
    total = len(cards)
    
    # Count mastered cards
    mastered = 0
    for card in cards:
        progress = db.query(Progress).filter(
            Progress.card_id == card.card_id,
            Progress.user_id == current_user.user_id,
            Progress.is_mastered == True
        ).first()
        if progress:
            mastered += 1
    
    percentage = int((mastered / total * 100)) if total > 0 else 0
    
    return {
        "mastered": mastered,
        "total": total,
        "percentage": percentage
    }

@app.post("/api/progress/card/{card_id}")
def update_progress(
    card_id: int,
    progress_update: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find or create progress record
    progress = db.query(Progress).filter(
        Progress.card_id == card_id,
        Progress.user_id == current_user.user_id
    ).first()
    
    if not progress:
        progress = Progress(
            card_id=card_id,
            user_id=current_user.user_id,
            times_studied=1,
            is_mastered=progress_update.is_mastered
        )
        db.add(progress)
    else:
        progress.times_studied += 1
        progress.is_mastered = progress_update.is_mastered
        progress.last_studied = datetime.utcnow()
    
    db.commit()
    
    return {"success": True}

@app.get("/")
def root():
    return {"message": "Memora API is running"}