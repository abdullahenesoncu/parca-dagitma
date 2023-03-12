import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams  } from 'react-router-dom';
import {
  TextField,
  Button,
  CircularProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Table,
  TableRow,
  TableCell,
  IconButton,
} from '@material-ui/core';
import { DataGridPro, GridRow, GridColumnHeaders } from '@mui/x-data-grid-pro';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const BACKEND_URL = 'http://127.0.0.1:8000';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  progress: {
    margin: theme.spacing(2),
  },
  list: {
    maxWidth: 360,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  listItem: {
    cursor: 'pointer',
  },
}));

function HomePage() {
  const classes = useStyles();

  const [ templates, setTemplates ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( true );
  const [ selectedTemplate, setSelectedTemplate ] = useState( null );
  const [ bookName, setBookName ] = useState( '' );

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading( true );
    fetch(`${BACKEND_URL}/app/getBookTemplates/`)
      .then((response) => response.json())
      .then((data) => {
        setTemplates(data);
        setIsLoading( false );
      });
  }, []);

  function handleTemplateChange( e ) {
    setSelectedTemplate( e.target.value );
  }

  function handleBookNameChange( e ) {
    setBookName( e.target.value );
  }

  const handleCreateBook = () => {
    const username = localStorage.getItem('username');
    fetch(`${BACKEND_URL}/app/createBookFromTemplate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookTemplateId: selectedTemplate,
        bookName,
        creator: username,
      }),
    })
      .then((response) => response.json())
      .then((data) => navigate( `/book/${data.token}` ) );
    };

  return (
    <div className={classes.container}>
      { isLoading ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Taslak Seçiniz</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              name="radio-buttons-group"
            >
              {
                templates.map( template => (
                  <FormControlLabel 
                    value={ template.id } 
                    checked={ template.id == selectedTemplate } 
                    onClick={ handleTemplateChange } 
                    control={<Radio />} 
                    label={template.name} />
                ) )
              }
            </RadioGroup>
          </FormControl>
          <TextField
            label="Kitap açıklaması"
            value={ bookName }
            onChange={ handleBookNameChange }
          />
          <Button
            variant="contained"
            color="primary"
            disabled={ bookName === '' || selectedTemplate == null }
            onClick={ handleCreateBook }
          >
            Kitap Oluştur
          </Button>
        </>
      )}
    </div>
  );
}

function BookPage() {
  const classes = useStyles();

  const { token } = useParams();
  const [ bookData, setBookData ] = useState( null );

  const navigate = useNavigate();

  function getBookData() {
    fetch(`${BACKEND_URL}/app/getBook/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBookData( data );
      });
  }

  useEffect(() => {
    const interval = setInterval(getBookData, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  function handleGrab( partId ) {
    const username = localStorage.getItem('username');
    fetch(`${BACKEND_URL}/app/grabBookPart/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partId: partId,
        owner: username,
      }),
    })
      .then((response) => response.json())
      .then((data) => {});
  }

  function handleRelease( partId ) {
    const username = localStorage.getItem('username');
    fetch(`${BACKEND_URL}/app/releaseBookPart/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partId: partId,
        owner: username,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
      });
  }
  
  return( 
    <div className={classes.container}>
      { !bookData ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <Table>
          { bookData.parts.map( part => (
            <TableRow>
              <TableCell size='small'> {part.name} </TableCell>
              <TableCell size='small'> {part.owner} </TableCell>
              <TableCell size='small'>
                { !part.owner ? 
                  (
                    <IconButton
                      onClick={() => handleGrab( part.id )}
                    >
                      <AddIcon/>
                    </IconButton>
                  ) 
                  : 
                  part.owner == localStorage.getItem( 'username' ) ? (
                      <IconButton
                        onClick={() => handleRelease( part.id )}
                      >
                        <RemoveIcon/>
                      </IconButton>
                  )
                  :
                  (
                    <></>
                  )
                }
              </TableCell>
            </TableRow>
          ) ) }
        </Table>
      )}
    </div>
  );
  
}

function App() {
  const classes = useStyles();

  const [ username, setUsername ] = useState( localStorage.getItem( 'username' ) );
  const [ usernameText, setUsernameText ] = useState( '' );

  function handleSubmitUsername() {
    if ( usernameText.length ) {
      localStorage.setItem( 'username', usernameText );
      setUsername( usernameText );
    }
  }

  function handleUsernameChange( e ) {
    setUsernameText( e.target.value );
  }

  function handleLogout() {
    localStorage.removeItem( 'username' );
    setUsername( '' );
    setUsernameText( '' );
  }

  if ( !username ) {  
    return (
      <div className={classes.container}>
        <TextField
          label="Kullanıcı Adı"
          value={ usernameText }
          onChange={ handleUsernameChange }
        />
        <Button
          variant="contained"
          color="primary"
          disabled={ usernameText === '' }
          onClick={ handleSubmitUsername }
        >
          Giriş Yap
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
      <Router>
        <Routes>
          <Route path="/" element={ <HomePage /> } />
          <Route path="/book/:token" element={ <BookPage /> } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
