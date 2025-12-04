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
    FlashcardCreate, FlashcardUpdate, FlashcardResponse
)
from app.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models import FlashcardLink

from app import metrics  # Import the metrics router

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

# Include metrics router
app.include_router(metrics.router)

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

@app.delete("/api/sets/{set_id}")
def delete_set(
    set_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the set
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    # Delete the set (cascades to delete all cards due to relationship)
    db.delete(flashcard_set)
    db.commit()
    
    return {"success": True, "message": "Flashcard set deleted"}

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

@app.get("/")
def root():
    return {"message": "Memora API is running"}

# ==========================================
# CARD LINKS ENDPOINTS (for Whiteboard Mode)
# ==========================================

@app.get("/api/cards/{card_id}/links")
def get_card_links(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all links for a specific card"""
    # Verify user owns this card's set
    card = db.query(Flashcard).filter(Flashcard.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get all links where this card is the source
    links = db.query(FlashcardLink).filter(
        FlashcardLink.from_card_id == card_id
    ).all()
    
    return links


@app.post("/api/cards/{from_card_id}/links")
def create_card_link(
    from_card_id: int,
    link_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a link between two cards"""
    to_card_id = link_data.get('to_card_id')
    
    if not to_card_id:
        raise HTTPException(status_code=400, detail="to_card_id is required")
    
    # Verify user owns both cards
    from_card = db.query(Flashcard).filter(Flashcard.card_id == from_card_id).first()
    to_card = db.query(Flashcard).filter(Flashcard.card_id == to_card_id).first()
    
    if not from_card or not to_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Verify both cards belong to user's sets
    from_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == from_card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    to_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == to_card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not from_set or not to_set:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if link already exists
    existing_link = db.query(FlashcardLink).filter(
        FlashcardLink.from_card_id == from_card_id,
        FlashcardLink.to_card_id == to_card_id
    ).first()
    
    if existing_link:
        return existing_link
    
    # Create new link
    new_link = FlashcardLink(
        from_card_id=from_card_id,
        to_card_id=to_card_id
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    return new_link


@app.delete("/api/links/{link_id}")
def delete_card_link(
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a card link"""
    link = db.query(FlashcardLink).filter(FlashcardLink.link_id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Verify user owns the cards in this link
    from_card = db.query(Flashcard).filter(Flashcard.card_id == link.from_card_id).first()
    
    if not from_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    flashcard_set = db.query(FlashcardSet).filter(
        FlashcardSet.set_id == from_card.set_id,
        FlashcardSet.user_id == current_user.user_id
    ).first()
    
    if not flashcard_set:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(link)
    db.commit()
    
    return {"success": True, "message": "Link deleted successfully"}