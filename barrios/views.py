from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from base.permissions import ClavePendiente
from . import models, serializers


class BarrioViewSet(ModelViewSet):
    queryset = models.Barrio.objects.all()
    serializer_class = serializers.BarrioSerializer
    permission_classes = [IsAuthenticated, ClavePendiente]
