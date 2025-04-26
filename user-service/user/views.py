from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.decorators import api_view 
from .models import User
from .serializers import UserCreateSerializer, UserInfoSerializer, UserListSerializer

class UserCreateAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer

class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserInfoSerializer
    lookup_field = 'id'

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer

@api_view(['POST'])
def get_user_id(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(f"{username}, {password}")
    user = get_object_or_404(User, username=username, password=password)
    return JsonResponse({"user_id": user.id})
