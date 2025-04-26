from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view 
from rest_framework import generics
from .models import Board, Column, Task
from .serializers import BoardSerializer, ColumnSerializer, TaskSerializer

@api_view(['GET'])
def get_board_id(request, user_id):
    board_ids = Board.objects.filter(members__contains=[user_id]).values_list('id', flat=True)
    return JsonResponse({"board_ids": list(board_ids)})

@api_view(['GET'])
def get_board(request, user_id):
    boards = Board.objects.filter(members__contains=[user_id])
    serializer = BoardSerializer(boards, many=True)
    return Response(serializer.data)

class BoardCreateAPIView(generics.CreateAPIView):
    model = Board
    serializer_class = BoardSerializer

class BoardDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    lookup_url_kwarg = 'board_id'

class ColumnCreateAPIView(generics.CreateAPIView):
    model = Column
    serializer_class = ColumnSerializer

class ColumnUpdateAPIView(generics.UpdateAPIView):
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer
    lookup_url_kwarg = 'column_id'

class ColumnDeleteAPIView(generics.DestroyAPIView):
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer
    lookup_url_kwarg = 'column_id'

class TaskUpdateAPIView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_url_kwarg = 'task_id'

@api_view(['POST'])
def create_task(request):
    column = get_object_or_404(Column, id=request.data.get('column'))
    title = request.data.get('title')
    # order = request.data.get('order')

    Task.objects.create(
        column=column,
        title=title,
        # order=order
    )

    # sibling_tasks = Task.objects.filter(column=column, order__gte=order)
    # for t in sibling_tasks:
    #     t.order += 1
    #     t.save()
    
    board = column.board
    serializer = BoardSerializer(board)
    return Response(serializer.data)

@api_view(['POST'])
def move_task(request):
    task_id = request.data.get('task_id')
    new_column = request.data.get('new_column')
    # new_order = request.data.get('new_order')
    task = get_object_or_404(Task, id=task_id)
    task.column = get_object_or_404(Column, id=new_column)
    # task.order = new_order
    task.save()
    
    # sibling_tasks = Task.objects.filter(column=task.column, order__gte=new_order)
    # for t in sibling_tasks:
    #     t.order += 1
    #     t.save()

    board = get_object_or_404(Column, id=new_column).board
    serializer = BoardSerializer(board)
    return Response(serializer.data)

@api_view(['GET'])
def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    # sibling_tasks = Task.objects.filter(column=task.column, order__gt=task.order)
    # for t in sibling_tasks:
    #     t.order -= 1
    #     t.save()

    board = task.column.board
    serializer = BoardSerializer(board)
    task.delete()
    return Response(serializer.data)
