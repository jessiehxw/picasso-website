"""webapps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from picasso import views

urlpatterns = [
    path('', views.global_stream_action, name='home'),
    path('global', views.global_stream_action, name='global'),
    path('profile', views.profile_action, name='profile'),
    path('add-picture', views.add_picture, name='add-picture'),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('logout', auth_views.logout_then_login, name='logout'),
    path('picture/<int:id>', views.get_picture, name='picture'),
    path('posts', views.posts_action, name='posts'),
    path('work', views.work_action, name='work'),
    path('new-post', views.new_post, name='new-post'),
    path('add-post', views.add_post, name='add-post'),
    path('get-work', views.get_work, name='get-work'),
    path('get-my-posts', views.get_my_posts, name='get-my-posts'),
    path('get-global', views.get_global, name='get-global'),
    path('payment', views.payment),
    path('add-comment', views.add_comment, name='add-comment'),
    path('like', views.like, name='like'),
    path('dislike', views.dislike, name='dislike')
]
