from django.urls import path
from .views import UserCreateAPIView, UserDetailAPIView, UserListAPIView, get_user_id

urlpatterns = [
    path('user/', UserCreateAPIView.as_view()),
    path('user/<int:id>/', UserDetailAPIView.as_view()),
    path('users/', UserListAPIView.as_view()),
    path('login/', get_user_id),
]
