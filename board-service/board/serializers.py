from rest_framework import serializers
from .models import Board, Column, Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'assigned_to_id', 'column']
        read_only_fields = ['id']

class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ['id', 'name', 'board', 'tasks']
        read_only_fields = ['id', 'tasks']

class BoardSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ['id', 'name', 'owner_id', 'members', 'columns']
        read_only_fields = ['id', 'columns']