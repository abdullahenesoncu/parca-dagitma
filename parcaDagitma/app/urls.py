from django.urls import path

from . import views

urlpatterns = [
    path('getBookTemplates/', views.getBookTemplates, name='getBookTemplates'),
    path('createBookFromTemplate/', views.createBookFromTemplate, name='createBookFromTemplate'),
    path('getBook/', views.getBook, name='getBook'),
    path('grabBookPart/', views.grabBookPart, name='grabBookPart'),
    path('releaseBookPart/', views.releaseBookPart, name='releaseBookPart'),
]