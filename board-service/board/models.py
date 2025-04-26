from django.db import models

# Create your models here.
class Board(models.Model):
    name = models.CharField(max_length=255)
    owner_id = models.IntegerField() 
    members = models.JSONField(default=list) 

    def __str__(self):
        return self.name

class Column(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} (Board {self.board_id})"

class Task(models.Model):
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    assigned_to_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} (Column {self.column_id})"
