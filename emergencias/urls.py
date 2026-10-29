from django.urls import path
from .views import PanicoPendientesView, PanicoResolverView, PanicoView

urlpatterns = [
    path('panico/', PanicoView.as_view()),
    path('panico/pendientes/', PanicoPendientesView.as_view()),
    path('panico/<int:alerta_id>/resolver/', PanicoResolverView.as_view()),
]
