from django.urls import path, include
from accounts.views import home

urlpatterns = [
    path("home/",home,name="home"),
]
