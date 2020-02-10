import React, {useState} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  withRouter,
} from 'react-router-dom';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/signin" component={SignIn} />
        <Route exact path="/home" component={Tasks} />
        <Route exact path="/myprofile" component={Profile} />
      </Switch>
    </Router>
  );
}

const Signup = withRouter (props => {
  const [name, setName] = useState ('');
  const [email, setEmail] = useState ('');
  const [password, setPassword] = useState ('');

  const submit = e => {
    e.preventDefault ();
    axios
      .post ('https://todo-test-1601.herokuapp.com/users', {
        name: name,
        email: email,
        password: password,
      })
      .then (res => {
        props.history.push ('/signin');
      });
    // console.log ('submit', props);
  };

  return (
    <div className="App">
      <form onSubmit={submit}>
        <div>
          <span>Name:</span>
          <input
            onChange={e => {
              setName (e.target.value);
            }}
            name="name"
            type="text"
            value={name}
          />
        </div>
        <div>
          <span>Email:</span><input
            onChange={e => {
              setEmail (e.target.value);
            }}
            name="email"
            type="text"
            value={email}
          />
        </div>

        <div>
          <span>Password:</span>
          <input
            onChange={e => {
              setPassword (e.target.value);
            }}
            name="password"
            type="text"
            value={password}
          />
        </div>

        <button type="submit">Signup</button>
      </form>
    </div>
  );
});

const SignIn = withRouter (props => {
  const [email, setEmail] = useState ('');
  const [password, setPassword] = useState ('');

  const submit = e => {
    e.preventDefault ();
    axios
      .post ('https://todo-test-1601.herokuapp.com/users/login', {
        email: email,
        password: password,
      })
      .then (res => {
        localStorage.setItem ('token', res.data.token);
        props.history.push ('/home');
      });
    // console.log ('submit', props);
  };

  return (
    <div className="App">
      <form onSubmit={submit}>
        <div>
          <span>Email:</span>
          <input
            onChange={e => {
              setEmail (e.target.value);
            }}
            name="email"
            type="text"
            value={email}
          />
        </div>

        <div>
          <span>Password:</span>
          <input
            onChange={e => {
              setPassword (e.target.value);
            }}
            name="password"
            type="text"
            value={password}
          />
        </div>

        <button type="submit">SignIn</button>
      </form>
    </div>
  );
});

const Tasks = () => {
  const [description, setDescription] = useState ('');
  const [completed, setCompleted] = useState (false);
  const [task, setTask] = useState ([]);

  React.useEffect (() => {
    axios
      .get ('https://todo-test-1601.herokuapp.com/tasks', {
        headers: {Authorization: 'Bearer ' + localStorage.getItem ('token')},
      })
      .then (res => {
        setTask (res.data);
      });
  }, []);

  const submit = e => {
    e.preventDefault ();
    axios
      .post (
        'https://todo-test-1601.herokuapp.com/tasks',
        {
          description: description,
          completed: completed,
        },
        {
          headers: {Authorization: 'Bearer ' + localStorage.getItem ('token')},
        }
      )
      .then (res => {
        setDescription ('');
        setCompleted (false);
        setTask ([...task, res.data]);
      });
  };
  return (
    <div className="App">
      <Link to="/myprofile">My Profile</Link>

      <div>Add Task</div>

      <div>
        <form onSubmit={submit}>
          <div>
            Description:<input
              onChange={e => {
                setDescription (e.target.value);
              }}
              value={description}
              type="text"
            />
            <input
              type="checkbox"
              checked={completed}
              onChange={() => {
                setCompleted (!completed);
              }}
            />
          </div>
          <button type="submit">Add Task</button>
        </form>
      </div>
      <div>
        {task.length > 0 &&
          task.map (v => {
            return (
              <div
                onClick={e => {
                  if (e.target.classList.contains ('cross')) {
                    const id = Array.from (e.currentTarget.classList)[0];
                    // console.log (Array.from (e.currentTarget.classList)[0]);
                    axios
                      .delete (
                        `https://todo-test-1601.herokuapp.com/tasks/${Array.from (e.currentTarget.classList)[0]}`,
                        {
                          headers: {
                            Authorization: 'Bearer ' +
                              localStorage.getItem ('token'),
                          },
                        }
                      )
                      .then (res => {
                        setTask (task.filter (v => v._id != id));
                      })
                      .catch (e => {});
                  }
                }}
                className={v._id}
              >
                {v.description}

                <input type="checkbox" checked={v.completed} />

                <button className="cross">X</button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const Profile = () => {
  const [profile, setProfile] = React.useState ({});

  React.useEffect (() => {
    axios
      .get ('https://todo-test-1601.herokuapp.com/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem ('token')}`,
        },
      })
      .then (res => {
        setProfile ({...res.data, password: null});
      });
  }, []);

  const submit = () => {
    let data = profile;
    // debugger;
    // delete data.password;

    axios
      .patch (
        'https://todo-test-1601.herokuapp.com/users/me',
        {
          age: data.age,
          name: data.name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem ('token')}`,
          },
        }
      )
      .then (res => {
        setProfile ({...res.data, password: null});
      })
      .catch (err => {
        alert ('error');
      });
  };

  return (
    <div className="App">
      Profile
      <div className={`${profile._id}`}>
        <div>
          <span>Name: </span>
          <input
            onChange={e => {
              setProfile ({...profile, name: e.target.value});
            }}
            name="name"
            type="text"
            value={profile.name}
          />
        </div>

        <div>
          <span>Email: </span>
          <input
            onChange={e => {
              setProfile ({...profile, email: e.target.value});
            }}
            name="email"
            type="text"
            value={profile.email}
          />
        </div>

        <div>
          <span>Age: </span>
          <input
            onChange={e => {
              setProfile ({...profile, age: e.target.value});
            }}
            name="age"
            type="text"
            value={profile.age}
          />
        </div>

        <div>
          <span>Password</span>
          <input
            onChange={e => {
              setProfile ({...profile, password: e.target.value});
            }}
            name="password"
            type="text"
            value={profile.password}
          />
        </div>

        <button onClick={submit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default App;
