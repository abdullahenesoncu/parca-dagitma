import { useState, useEffect, useRef } from 'react';
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
  TableContainer,
  TableBody,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const BACKEND_URL = 'http://192.168.0.13:8000';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
    console.log( 'selectedTemplate', selectedTemplate );
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
  const tableRef = useRef(null);
  const [tableHeight, setTableHeight] = useState('auto');

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

  useEffect(() => {
    if (tableRef.current) {
      const tableHeight = tableRef.current.offsetHeight;
      setTableHeight(tableHeight);
    }
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

  const username = localStorage.getItem( 'username' );
  
  return( 
    <div className={classes.container}>
      { !bookData ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <div style={{ height: tableHeight, width: '90vw', marginTop: 10, marginBottom: 10 }}>
          <Table ref={tableRef}>
            <colgroup>
              <col style={{width:'30%'}}/>
              <col style={{width:'40%'}}/>
              <col style={{width:'30%'}}/>
            </colgroup>
            <TableBody>
              <TableRow style={{ height: 30 }}>
                <TableCell>{ bookData.creator } tarafından</TableCell>
                <TableCell>{ bookData.name }</TableCell>
                <TableCell>{ bookData.templateName } dağıtımı</TableCell>
              </TableRow>
              { bookData.parts.map( part => (
                <TableRow style={{ height: 30 }}>
                  <TableCell size='small' style={{ padding: "0px 12px 0px 12px" }}> {part.name} </TableCell>
                  <TableCell size='small' style={{ padding: "0px 12px 0px 12px" }}> {part.owner} </TableCell>
                  <TableCell size='small' style={{ padding: "0px 12px 0px 12px" }}>
                    { !part.owner ? 
                      (
                        <IconButton
                          onClick={() => handleGrab( part.id )}
                          size='small'
                        >
                          <AddIcon/>
                        </IconButton>
                      ) 
                      : 
                      part.owner == username || bookData.creator == username ? (
                          <IconButton
                            onClick={() => handleRelease( part.id )}
                            size='small'
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
            </TableBody>
          </Table>
        </div>
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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div>Her türlü soru, sorun ve önerileriniz için:</div>
          <div>+90 (531) 624 83 37</div>
          <div>abdullahenesoncu@gmail.com</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 10px 10px 10px'}}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Çıkış Yap
        </Button>
        <div>Hoşgeldiniz {username}</div>
      </div>
      <Router>
        <Routes>
          <Route path="/olustur" element={ <HomePage /> } />
          <Route path="/book/:token" element={ <BookPage /> } />
        </Routes>
      </Router>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div>Her türlü soru, sorun ve önerileriniz için:</div>
        <div>+90 (531) 624 83 37</div>
        <div>abdullahenesoncu@gmail.com</div>
      </div>
    </>
  );
}

export default App;
