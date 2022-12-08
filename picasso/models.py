from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="profile")
    user_bio = models.CharField(max_length=200)
    user_image = models.CharField(max_length=200)


class Picture(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="pictures")
    creation_time = models.DateTimeField()
    title = models.CharField(max_length=50)
    picture = models.FileField(blank=True)
    content_type = models.CharField(max_length=50)


class Post(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="posts")
    creation_time = models.DateTimeField()
    picture_id = models.CharField(max_length=50)
    picture_title = models.CharField(max_length=50)
    text = models.CharField(max_length=200)
    ip_addr = models.GenericIPAddressField()
    like_id = models.CharField(max_length=1000)
    like_count = models.IntegerField()
    dislike_id = models.CharField(max_length=1000)
    dislike_count = models.IntegerField()

    def __str__(self):
        return f'id={self.id}, text="{self.text}"'


class Comment(models.Model):
    text = models.CharField(max_length=200)
    creation_time = models.DateTimeField()
    creator = models.ForeignKey(User, on_delete=models.PROTECT, related_name="comments")
    post_id = models.CharField(max_length=200)
