import json
from django.http import HttpResponse
from django.shortcuts import redirect, render, resolve_url, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone, formats
from io import BytesIO, StringIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
import threading
import time
from picasso import ImageManipulation as imp
from picasso.forms import PictureForm
from picasso.models import Picture, Post, Comment, Profile
from django.shortcuts import get_object_or_404, redirect


def _known_user_check(action_function):
    def my_wrapper_function(request, *args, **kwargs):

        if 'title' not in request.session:
            request.session['title'] = 'Picasso'

        if 'picture' not in request.session:
            request.session['picture'] = request.user.social_auth.get(provider='google-oauth2').extra_data['picture']

        user_list = list(Profile.objects.all().values_list('user', flat=True))

        if request.user not in user_list:
            new_profile = Profile(user=request.user,
                                  user_bio="",
                                  user_image=request.session['picture'],
                                  )
            new_profile.save()

        return action_function(request, *args, **kwargs)

    return my_wrapper_function


def login_action(request):
    if request.method == 'GET':
        context = {}
        # At this point, the form data is valid.  Register and login the user.
        return render(request, 'picasso/login.html', context)


@login_required
@_known_user_check
def global_stream_action(request):
    context = {}
    if request.method == 'GET':
        # context['profile'] = request.user.profile
        return render(request, 'picasso/global.html', context)

    return render(request, 'picasso/global.html', context)


@login_required
@_known_user_check
def profile_action(request):
    context = {}
    posts = Post.objects.all()

    total_like = 0
    total_dislike = 0

    for post in posts:
        if post.created_by.id == request.user.id:
            total_like += post.like_count
            total_dislike += post.dislike_count

    context['total_like'] = total_like
    context['total_dislike'] = total_dislike

    if request.method == 'GET':
        return render(request, 'picasso/my_profile.html', context)

    return render(request, 'picasso/my_profile.html', context)


@login_required
@_known_user_check
def posts_action(request):
    context = {}
    if request.method == 'GET':
        # context['profile'] = request.user.profile
        return render(request, 'picasso/my_posts.html', context)

    return render(request, 'picasso/my_posts.html', context)


@login_required
@_known_user_check
def work_action(request):
    context = {}
    if request.method == 'GET':
        # context['profile'] = request.user.profile
        return render(request, 'picasso/my_work.html', context)

    return render(request, 'picasso/my_work.html', context)


@login_required
@_known_user_check
def add_picture(request):
    context = {}
    if request.method == 'GET':
        context['form'] = PictureForm()
        return render(request, 'picasso/convert.html', context)

    form = PictureForm(request.POST, request.FILES)
    if not form.is_valid():
        context['form'] = form
        # return render(request, 'my_profile.html', context)

    picture = Picture()
    picture.title = request.POST['title']
    picture.created_by = request.user
    picture.picture = form.cleaned_data['picture']
    picture.content_type = form.cleaned_data['picture'].content_type
    picture.creation_time = timezone.now()
    picture.like_count = 0
    picture.save()

    conversion_thread = threading.Thread(target=update_picture, name='Conversion Thread', args=[picture])
    conversion_thread.start()

    context["picture"] = picture
    return render(request, 'picasso/convert.html', context)


def update_picture(picture):
    picture.picture = image_conversion(picture.picture.path, picture.content_type, picture.title)
    picture.save()


# redirect to the new post page
@login_required
@_known_user_check
def new_post(request):
    images = Picture.objects.all()
    user_image = []

    for image in images:
        if image.created_by.id == request.user.id:
            user_image.append(image)

    context = {"pictures": user_image}

    if request.method == 'GET':
        return render(request, 'picasso/new_post.html', context)


# add new post through the form
@login_required
@_known_user_check
def add_post(request):
    images = Picture.objects.all()
    user_image = []

    for image in images:
        if image.created_by.id == request.user.id:
            user_image.append(image)

    context = {'posts': Post.objects.all(), 'error': '0', "pictures": user_image}

    if 'description' not in request.POST or not request.POST['description']:
        context['error'] = '1'
        return render(request, 'picasso/new_post.html', context)

    # Get the picture id of the picture with the same title created by the user
    all_picture = Picture.objects.all()
    for picture in all_picture:
        if picture.created_by.id == request.user.id and picture.title == request.POST['my_images']:
            new_post = Post(text=request.POST['description'],
                            created_by=request.user,
                            creation_time=timezone.now(),
                            picture_id=picture.id,
                            picture_title=picture.title,
                            ip_addr=request.META['REMOTE_ADDR'],
                            like_count=0,
                            dislike_count=0)
            new_post.save()
            break

    return redirect('work')


@login_required
@_known_user_check
def add_comment(request):
    new_comment = Comment(creator=request.user,
                          creation_time=timezone.now(),
                          post_id=request.POST['post_id'],
                          text=request.POST['comment_text'])
    new_comment.save()

    return get_comment_json_dumps_serializer(request)


def get_comment_json_dumps_serializer(request):
    response_data = []

    profile_dict = {}
    for profile in Profile.objects.all():
        profile_dict[profile.user] = profile.user_image

    for comment in Comment.objects.all():
        comment_item = {
            'id': comment.id,
            "creator": comment.creator.username,
            'creator_avatar': profile_dict[comment.creator],
            'creator_id': comment.creator.id,
            "creation_time": str(formats.date_format(timezone.localtime(comment.creation_time), "n/j/Y g:i A")),
            "post_id": comment.post_id,
            "text": comment.text,
        }
        response_data.append(comment_item)

    response_json = json.dumps(response_data)

    return HttpResponse(response_json, content_type='application/json', status=200)


@login_required
@_known_user_check
def get_picture(request, id):
    picture = get_object_or_404(Picture, id=id)

    # Maybe we don't need this check as form validation requires a picture be uploaded.
    # But someone could have delete the picture leaving the DB with a bad references.
    if not picture.picture:
        raise Http404

    return HttpResponse(picture.picture, content_type=picture.content_type)


# Take an image path from model saved location, convert to mosaic picture and return a Django InMemoryUploadedFile
# Object
def image_conversion(path, content_type, name):
    original_img = imp.open_image(path)
    mosaic_img = imp.convert_mosaic(original_img)

    buffer = BytesIO()
    mosaic_img.save(fp=buffer, format=original_img.format)
    pil_img = ContentFile(buffer.getvalue())

    return InMemoryUploadedFile(pil_img, None, name, content_type, pil_img.tell, None)


# get-work
@login_required
@_known_user_check
def get_work(request):
    response_data = []
    pics = []

    for picture in Picture.objects.all():
        if picture.created_by.id == request.user.id:
            pic_item = {
                'id': picture.id,
                'user': picture.created_by.username,
                'user_id': picture.created_by.id,
                'time': str(formats.date_format(timezone.localtime(picture.creation_time), "n/j/Y g:i A")),
                'title': picture.title,
            }
            pics.append(pic_item)

    response_data = {'pictures': pics}

    response_json = json.dumps(response_data)
    return HttpResponse(response_json, content_type='application/json')


@login_required
@_known_user_check
def get_global(request):
    response_data = []
    posts = []
    comments = []

    profile_dict = {}
    for profile in Profile.objects.all():
        profile_dict[profile.user] = profile.user_image

    if "sort_by_options" in request.GET:
        sort_by_options = request.GET["sort_by_options"]

        if "order_option" in request.GET:
            order_option = request.GET["order_option"]
        else:
            order_option = ""

        if sort_by_options == "popularity" and order_option == "ascending":
            p = Post.objects.all().order_by('dislike_count')

        elif sort_by_options == "popularity" and order_option == "descending":
            p = Post.objects.all().order_by('like_count')

        elif sort_by_options == "creation_time" and order_option == "ascending":
            p = Post.objects.all().order_by('-creation_time')

        elif sort_by_options == "creation_time" and order_option == "descending":
            p = Post.objects.all().order_by('creation_time')
    else:
        p = Post.objects.all().order_by('creation_time')

    for post in p:
        like_user = post.like_id.split(", ")
        dislike_user = post.dislike_id.split(", ")

        if str(request.user.id) in like_user:
            # 1: clicked like
            like_check = 1
        elif str(request.user.id) in dislike_user:
            # 2: clicked dislike
            like_check = 2
        else:
            # 0: didn't click
            like_check = 0

        post_item = {
            'id': post.id,
            'creator_avatar': profile_dict[post.created_by],
            'creator': post.created_by.username,
            'time': str(formats.date_format(timezone.localtime(post.creation_time), "n/j/Y g:i A")),
            'picture_id': post.picture_id,
            'picture_title': post.picture_title,
            'text': post.text,
            'like_check': like_check,
            'like_count': post.like_count,
            'dislike_count': post.dislike_count
        }
        posts.append(post_item)

    for comment in Comment.objects.all():
        comment_item = {
            'id': comment.id,
            'creator_avatar': profile_dict[comment.creator],
            "creator": comment.creator.username,
            'creator_id': comment.creator.id,
            "creation_time": str(formats.date_format(timezone.localtime(comment.creation_time), "n/j/Y g:i A")),
            "post_id": comment.post_id,
            "text": comment.text,
        }
        comments.append(comment_item)

    response_data = {'posts': posts, 'comments': comments}

    response_json = json.dumps(response_data)
    return HttpResponse(response_json, content_type='application/json')


@login_required
@_known_user_check
def get_my_posts(request):
    response_data = []
    my_posts = []
    comments = []

    profile_dict = {}
    for profile in Profile.objects.all():
        profile_dict[profile.user] = profile.user_image

    for post in Post.objects.all():
        if post.created_by.id == request.user.id:
            post_item = {
                'id': post.id,
                'creator_avatar': profile_dict[post.created_by],
                'creator': post.created_by.username,
                'time': str(formats.date_format(timezone.localtime(post.creation_time), "n/j/Y g:i A")),
                'picture_id': post.picture_id,
                'picture_title': post.picture_title,
                'like_count': post.like_count,
                'dislike_count': post.dislike_count,
                'text': post.text,
            }
            my_posts.append(post_item)

    for comment in Comment.objects.all():
        comment_item = {
            'id': comment.id,
            'creator_avatar': profile_dict[comment.creator],
            "creator": comment.creator.username,
            'creator_id': comment.creator.id,
            "creation_time": str(formats.date_format(timezone.localtime(comment.creation_time), "n/j/Y g:i A")),
            "post_id": comment.post_id,
            "text": comment.text,
        }
        comments.append(comment_item)

    response_data = {'my_posts': my_posts, 'comments': comments}

    response_json = json.dumps(response_data)
    return HttpResponse(response_json, content_type='application/json')


@login_required
@_known_user_check
def like(request):
    post_id = request.POST['post_id']
    post = Post.objects.get(id=post_id)
    post.like_count += 1
    post.like_id += str(request.user.id)
    post.like_id += ", "
    post.save()

    return HttpResponse(str(post_id), content_type=str)


@login_required
@_known_user_check
def dislike(request):
    post_id = request.POST['post_id']
    post = Post.objects.get(id=post_id)
    post.dislike_count += 1
    post.dislike_id += str(request.user.id)
    post.dislike_id += ", "
    post.save()

    return HttpResponse(str(post_id), content_type=str)


def _my_json_error_response(message, status=200):
    response_json = '{ "error": "' + message + '" }'
    return HttpResponse(response_json, content_type='application/json', status=status)


@login_required
@_known_user_check
def payment(request):
    if request.method == 'GET':
        return render(request, 'picasso/payment.html', {})
