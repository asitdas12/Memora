from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Flashcard Set schemas
class FlashcardSetCreate(BaseModel):
    title: str
    description: Optional[str] = None

class FlashcardSetResponse(BaseModel):
    set_id: int
    title: str
    description: Optional[str]
    created_at: datetime
    card_count: int = 0
    
    class Config:
        from_attributes = True

# Flashcard schemas
class FlashcardCreate(BaseModel):
    front_text: str
    back_text: str
    category: Optional[str] = None
    order_number: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class FlashcardUpdate(BaseModel):
    front_text: Optional[str] = None
    back_text: Optional[str] = None
    category: Optional[str] = None
    order_number: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class FlashcardResponse(BaseModel):
    card_id: int
    front_text: str
    back_text: str
    category: Optional[str]
    order_number: Optional[int]
    position_x: Optional[float]
    position_y: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True