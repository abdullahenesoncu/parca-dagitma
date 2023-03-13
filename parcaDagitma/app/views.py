from django.http import JsonResponse
from app.models import *
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def getBookTemplates( request ):
    res = []
    for bt in BookTemplate.objects.all():
        res.append( bt.dump() )
    return JsonResponse( res, safe=False )

@csrf_exempt
def createBookFromTemplate( request ):
    data = json.loads( request.body )
    bookTemplateId = data.get( 'bookTemplateId' )
    bookName = data.get( 'bookName' )
    creator = data.get( 'creator' )

    if Book.objects.filter( creator=creator, name=bookName ).count():
        return JsonResponse( Book.objects.filter( creator=creator, name=bookName ).first().dump() )
    
    print( bookTemplateId, BookTemplate.objects.get( pk=bookTemplateId ) )
    
    book = Book.objects.create( creator=creator, name=bookName, bookTemplate=BookTemplate.objects.get( pk=bookTemplateId ) )
    return JsonResponse( book.dump() )

@csrf_exempt
def getBook( request ):
    data = json.loads( request.body )
    token = data.get( 'token' )
    return JsonResponse( Book.objects.filter( token=token ).first().dump() )

@csrf_exempt
def grabBookPart( request ):
    data = json.loads( request.body )
    partId = data.get( 'partId' )
    owner = data.get( 'owner' )

    part = BookPart.objects.get( pk=partId )
    if part.owner:
        return JsonResponse( {} )
    
    part.owner = owner
    part.save()
    return JsonResponse( part.dump() )

@csrf_exempt
def releaseBookPart( request ):
    data = json.loads( request.body )
    partId = data.get( 'partId' )
    owner = data.get( 'owner' )

    part = BookPart.objects.get( pk=partId )
    print(part.owner, part.book.creator)
    if part.owner != owner and part.book.creator != owner:
        return JsonResponse( {} )
    
    part.owner = ''
    part.save()
    return JsonResponse( part.dump() )