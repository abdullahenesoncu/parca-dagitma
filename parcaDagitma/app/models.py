from django.db import models
from parcaDagitma.helpers import randomString

class BookTemplate( models.Model ):
    name = models.CharField( max_length=1000, blank=False )

    def dump( self ):
        return {
            "id": self.id,
            "name": self.name,
            "parts": [ part.dump() for part in self.parts.all() ],
        }

    def __str__( self ):
        return self.name

class BookPartTemplate( models.Model ):
    bookTemplate = models.ForeignKey( BookTemplate, null=False, blank=False, on_delete=models.CASCADE, related_name='parts' )
    name = models.CharField( max_length=1000, blank=False )

    def dump( self ):
        return {
            "id": self.id,
            "bookTemplateId": self.bookTemplate.id,
            "name": self.name,
        }

    def __str__( self ):
        return str( self.bookTemplate ) + '/' + self.name

class Book( models.Model ):
    bookTemplate = models.ForeignKey( BookTemplate, null=False, blank=False, on_delete=models.CASCADE )
    creator = models.CharField( max_length=1000, blank=False )
    name = models.CharField( max_length=1000, blank=False )
    token = models.CharField( max_length=1000, blank=True )

    def save( self, *args, **kwargs ):
        pk = self.pk
        if not self.token:
            self.token = randomString()
        super().save( *args, **kwargs )
        if not pk:
            for part in self.bookTemplate.parts.all():
                BookPart.objects.create( book=self, bookPartTemplate=part )

    def dump( self ):
        return {
            "id": self.id,
            "creator": self.creator,
            "name": self.name,
            "token": self.token,
            "parts": [ part.dump() for part in self.parts.all() ]
        }
    
    def __str__( self ):
        return self.name + ' by ' + self.creator

class BookPart( models.Model ):
    book = models.ForeignKey( Book, null=False, blank=False, on_delete=models.CASCADE, related_name="parts" )
    bookPartTemplate = models.ForeignKey( BookPartTemplate, null=False, blank=False, on_delete=models.CASCADE )
    owner = models.CharField( max_length=1000, blank=True, null=True, default='' )

    def dump( self ):
        return {
            "id": self.id,
            "bookId": self.book.id,
            "creator": self.book.creator,
            "owner": self.owner,
            "name": self.bookPartTemplate.name,
        }

    def __str__( self ):
        return str( self.book ) + '/' + str( self.bookPartTemplate )
