from django.urls import path
from .views import *

from . import views

urlpatterns = [
    path('', ClothesTryOnView.as_view())
    # path('', views.index, name='index'),
]