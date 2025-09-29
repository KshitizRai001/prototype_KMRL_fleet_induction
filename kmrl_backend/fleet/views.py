from rest_framework import viewsets
from .models import Train
from .serializers import TrainSerializer

class TrainViewSet(viewsets.ModelViewSet):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer