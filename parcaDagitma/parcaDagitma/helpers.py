import random

def randomString( length=12 ):
    res = ""
    for i in range( length ):
        res += chr( ord( 'a' ) + random.randint( 0, 25 ) )
    
    return res