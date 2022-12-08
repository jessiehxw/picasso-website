from django import forms

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from picasso.models import Picture

MAX_UPLOAD_SIZE = 2500000

"""
lass GlobalStreamForm(forms.ModelForm):
    class Meta:
        model = Post
        exclude = (
            'user',
            'creation_time',
        )
        widgets = {
            'text': forms.TextInput(attrs={'id': 'id_post_input_text'})
        }
        labels = {
            'text': 'New Post',
        }
"""

class PictureForm(forms.ModelForm):
    class Meta:
        model = Picture
        fields = ('title', 'picture')
        widgets = {
            'title': forms.Textarea(attrs={'id': 'id_picture_title_text', 'rows': '1'}),
            'picture': forms.FileInput(attrs={'id': 'id_picture', 'required': True, 'accept': {'image/jpg', 'image/jpeg', 'image/png'}})
        }
        labels = {
            'title': 'Title'
        }

        def clean(self):
            cleaned_data = super().clean()

            picture = cleaned_data.get('id_picture')

            if not picture:
                raise forms.ValidationError('No image selected!')

            return cleaned_data




