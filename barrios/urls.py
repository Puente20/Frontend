from rest_framework.routers import DefaultRouter

from .views import BarrioViewSet

router = DefaultRouter()
router.register('barrios', BarrioViewSet, basename='barrio')

urlpatterns = router.urls
