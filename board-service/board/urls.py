from django.urls import path, include
from board import views

urlpatterns = [
    path('board/id/<int:user_id>', views.get_board_id),
    path('board/get/<int:user_id>', views.get_board),
    path('board/', views.BoardCreateAPIView.as_view()),
    path('board/<int:board_id>', views.BoardDetailAPIView.as_view()),
    path('column/', views.ColumnCreateAPIView.as_view()),
    path('column/<int:column_id>', views.ColumnUpdateAPIView.as_view()),
    path('column/delete/<int:column_id>', views.ColumnDeleteAPIView.as_view()),
    path('task/', views.create_task),
    path('task/<int:task_id>', views.TaskUpdateAPIView.as_view()),    
    path('task/delete/<int:task_id>', views.delete_task),
    path('task/move', views.move_task),
]
