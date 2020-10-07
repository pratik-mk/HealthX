from flask import Flask, render_template, redirect, url_for, request
from flask_bootstrap import Bootstrap
from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length
from flask_sqlalchemy  import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import balance
from flask_uploads import UploadSet, configure_uploads, IMAGES
from werkzeug.utils import secure_filename
from werkzeug.datastructures import  FileStorage
import os
# Keras
import tensorflow as tf 
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.vgg16 import preprocess_input
import numpy as np 

app = Flask(__name__)

app.config['SECRET_KEY'] = 'Thisissupposedtobesecret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///F:\\project\\HealthX\\machine-learning\\database\\database.db'
#F:\project\HealthX\machine-learning\building_user_login_system-master\finish
photos = UploadSet('photos', IMAGES)
app.config['UPLOADED_PHOTOS_DEST'] = 'uploads'
configure_uploads(app, photos)

bootstrap = Bootstrap(app)
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15), unique=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(80))
    public_key = db.Column(db.String(80),unique=True)
    private_key = db.Column(db.String(80),unique=True)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class LoginForm(FlaskForm):
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15)])
    password = PasswordField('password', validators=[InputRequired(), Length(min=8, max=80)])
    remember = BooleanField('remember me')

class RegisterForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(), Email(message='Invalid email'), Length(max=50)])
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15)])
    password = PasswordField('password', validators=[InputRequired(), Length(min=8, max=80)])
    private_key= StringField('private_key',validators=[InputRequired(),Length(64)])
    public_key= StringField('public_key',validators=[InputRequired(),Length(42)])

model = load_model("models/pnumonia_resnet.h5")
def pred_img(path):
	img = image.load_img(path, target_size=(224, 224))
	x = image.img_to_array(img)
	x = np.expand_dims(x, axis=0)
	img_data = preprocess_input(x)
	classes = model.predict(img_data)
	New_pred = np.argmax(classes, axis=1)
	str1 = "Normal"
	str2 = "Pnumonia"
	if New_pred==[1]:
		return str1
	else:
		return str2



	


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if check_password_hash(user.password, form.password.data):
                login_user(user, remember=form.remember.data)
                return redirect(url_for('dash'))

        return '<h1>Invalid username or password</h1>'
        #return '<h1>' + form.username.data + ' ' + form.password.data + '</h1>'

    return render_template('login.html', form=form)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = RegisterForm()

    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data, method='sha256')
        new_user = User(username=form.username.data, email=form.email.data, password=hashed_password,private_key=form.private_key.data,public_key=form.public_key.data)
        db.session.add(new_user)
        db.session.commit()

        return '<h1>New user has been created!</h1>'
        #return '<h1>' + form.username.data + ' ' + form.email.data + ' ' + form.password.data + '</h1>'

    return render_template('signup.html', form=form)



@app.route('/tran_success', methods=['GET','POST'])
@login_required
def dashboard():
	preds = ""
	if request.method == 'POST' and 'photo' in request.files:
		f = photos.save(request.files['photo'])
		path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], f)
		print(path)
		preds = pred_img(path)
		os.remove(path)
	return render_template('dashboard.html', name=current_user.username, bal=balance.bal(current_user.public_key), preds=preds)

# start
@app.route('/dash', methods=['GET'])
@login_required
def dash():
    return render_template('dash.html')

@app.route('/initiate_payment', methods=['GET'])
@login_required
def initiate_payment():
    return redirect("http://localhost:3000/send_tx", code=302)
# end

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)


