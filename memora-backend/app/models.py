from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, LargeBinary, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    # google_id = Column(String, unique=True, nullable=True) # we may decide to discard this
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    flashcard_sets = relationship("FlashcardSet", back_populates="owner")

class FlashcardSet(Base):
    __tablename__ = "flashcard_sets"
    
    set_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="flashcard_sets")
    flashcards = relationship("Flashcard", back_populates="flashcard_set", cascade="all, delete-orphan")

class Flashcard(Base):
    __tablename__ = "flashcards"
    
    card_id = Column(Integer, primary_key=True, index=True)
    set_id = Column(Integer, ForeignKey("flashcard_sets.set_id"))
    front_text = Column(Text, nullable=False)
    back_text = Column(Text, nullable=False)
    front_image = Column(LargeBinary, nullable=True)
    back_image = Column(LargeBinary, nullable=True)
    category = Column(String, nullable=True)
    order_number = Column(Integer, nullable=True)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    flashcard_set = relationship("FlashcardSet", back_populates="flashcards")
    links_from = relationship("FlashcardLink", foreign_keys="[FlashcardLink.from_card_id]", back_populates="from_card")
    links_to = relationship("FlashcardLink", foreign_keys="[FlashcardLink.to_card_id]", back_populates="to_card")

class FlashcardLink(Base):
    __tablename__ = "flashcard_links"
    
    link_id = Column(Integer, primary_key=True, index=True)
    from_card_id = Column(Integer, ForeignKey("flashcards.card_id"))
    to_card_id = Column(Integer, ForeignKey("flashcards.card_id"))
    link_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    from_card = relationship("Flashcard", foreign_keys=[from_card_id], back_populates="links_from")
    to_card = relationship("Flashcard", foreign_keys=[to_card_id], back_populates="links_to")

class Metric(Base):
    __tablename__ = "metrics"
    
    metric_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)  # Optional: track per-user metrics
    type = Column(String, index=True, nullable=False)  # 'page_load', 'error', 'latency', etc.
    data = Column(JSON, nullable=False)  # Store all metric data as JSON
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Optional relationship to user
    user = relationship("User")
    
    def __repr__(self):
        return f"<Metric(metric_id={self.metric_id}, type={self.type}, created_at={self.created_at})>"