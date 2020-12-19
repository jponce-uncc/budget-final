# imports
import os                 # os is used to get environment variables IP & PORT
from flask import Flask     # Flask is the web app that we will customize
from flask import render_template
from flask import request  
from flask import redirect, url_for 
from database import db
from models import User as User
from forms import RegisterForm 
from flask import session
import bcrypt
from forms import LoginForm
from forms import RegisterForm, LoginForm


app = Flask(__name__)     # create an app


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flask_note_app.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS']= False

#  Bind SQLAlchemy db object to this Flask app
db.init_app(app)

app.config['SECRET_KEY'] = 'SE3155'

# Setup models
with app.app_context():
    db.create_all()   # run under the app context

    

@app.route('/')
@app.route('/index')
def index():
    #get user from database
    if session.get('user'):
        return render_template('index.html', user = session['user'])
    return render_template("index.html")



@app.route('/budget')
def get_notes():
    # # retrieve user from database
    # check if a user is saved in session
    if session.get('user'):
    # retrieve notes from database
        my_budget = db.session.query(budget).filter_by(user_id=session['user_id']).all()

        return render_template('dashboard.js', budget=my_budget, user=session['user'])
    else:
        return redirect(url_for('login'))



@app.route('/dashboard/new', methods=['GET', 'POST'])
def new_budget():
    # check if a user is saved in session
    if session.get('user'):
        # check method used for request
        if request.method == 'POST':
            #get title data
            title = request.form['title']
            #create data stamp

            from datetime import date
            today = date.today()
            # format date mm/dd/yyyy
            today = today.strftime("%m-%d-%Y")

            newEntry = budget(title, text, today, session['user_id'])
            db.session.add(newEntry)
            db.session.commit()

            return redirect(url_for('get_budget'))
        else:
            return render_template('newbudget.html', user=session['user'])
    else:
        # user not in session redirect to login
        return redirect(url_for('login'))        


@app.route('/register', methods=['POST', 'GET'])
def register():
    form = RegisterForm()
    # validate_on_submit only validates using POST
    if form.validate_on_submit():
        # form validation included a criteria to check the username does not exist
        # we can know we are safe to add the user to the database
        password_hash = bcrypt.hashpw(
            request.form['password'].encode('utf-8'), bcrypt.gensalt())
        first_name = request.form['firstname']
        last_name = request.form['lastname']
        new_record = User(first_name, last_name, request.form['email'], password_hash)
        db.session.add(new_record)
        db.session.commit()
        # save the user's name to the session
        session['user'] = first_name
        # get the id of the newly created database record
        the_user = db.session.query(User).filter_by(email=request.form['email']).one()
        # save the user's id to the session
        session['user_id'] = the_user.id

        return redirect(url_for('get_budget'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['POST', 'GET'])
def login():
    login_form = LoginForm()
    # validate_on_submit only validates using POST
    if login_form.validate_on_submit():
        # we know user exists. We can use one()
        the_user = db.session.query(User).filter_by(email=request.form['email']).one()
        # user exists check password entered matches stored password
        if bcrypt.checkpw(request.form['password'].encode('utf-8'), the_user.password):
            # password match add user info to session
            session['user'] = the_user.first_name
            session['user_id'] = the_user.id
            # render view
            return redirect(url_for('get_budget'))

        # password check failed
        # set error message to alert user
        login_form.password.errors = ["Incorrect username or password."]
        return render_template("login.html", form=login_form)
    else:
        # form did not validate or GET request
        return render_template("login.html", form=login_form)

@app.route('/logout')
def logout():
    # check if a user is saved in session
    if session.get('user'):
        session.clear()

    return redirect(url_for('index'))




app.run(host=os.getenv('IP', '127.0.0.1'),port=int(os.getenv('PORT', 5000)),debug=True)

# To see the web page in your web browser, go to the url,
#   http://127.0.0.1:5000

# Note that we are running with "debug=True", so if you make changes and save it
# the server will automatically update. This is great for development but is a
# security risk for production.