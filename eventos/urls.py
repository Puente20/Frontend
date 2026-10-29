from django.urls import path

from . import views

urlpatterns = [
    path('stream/', views.stream),
    path('panico/', views.alerta_panico_view, name='eventos-panico'),
    path('historico/', views.historico_alertas, name='eventos-historico')
]
