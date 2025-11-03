"""
Flask Portfolio Application
Simple Flask backend replacing Django
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allow CORS for API
CORS(app)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    first_name = db.Column(db.String(150))
    last_name = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    avatar = db.Column(db.String(255))
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    birth_date = db.Column(db.Date)
    website = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    
    user = db.relationship('User', backref=db.backref('profile', uselist=False))

    def to_dict(self):
        user_data = self.user.to_dict() if self.user else None
        return {
            'id': self.id,
            'user': user_data,
            'avatar': self.avatar,
            'bio': self.bio,
            'location': self.location,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'website': self.website,
            'phone': self.phone
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    skill_type = db.Column(db.String(10), nullable=False)  # tech, soft, tool, lang
    proficiency = db.Column(db.Integer, default=0)  # 0-100
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'skill_type': self.skill_type,
            'proficiency': self.proficiency,
            'description': self.description,
            'icon': self.icon
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))
    url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Many-to-many relationship with skills
    technologies = db.relationship('Skill', secondary='project_skills', lazy='subquery',
                                   backref=db.backref('projects', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image': self.image,
            'url': self.url,
            'github_url': self.github_url,
            'featured': self.featured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'technologies': [tech.to_dict() for tech in self.technologies]
        }

# Association table for many-to-many relationship
project_skills = db.Table('project_skills',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), primary_key=True)
)

class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text, nullable=False)
    
    # Many-to-many relationship with skills
    skills_used = db.relationship('Skill', secondary='experience_skills', lazy='subquery',
                                 backref=db.backref('experiences', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'current': self.current,
            'description': self.description,
            'skills_used': [skill.to_dict() for skill in self.skills_used]
        }

# Association table for experience skills
experience_skills = db.Table('experience_skills',
    db.Column('experience_id', db.Integer, db.ForeignKey('experiences.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), primary_key=True)
)

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    degree = db.Column(db.String(200), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    field_of_study = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)
    gpa = db.Column(db.Numeric(3, 2))
    
    def to_dict(self):
        return {
            'id': self.id,
            'degree': self.degree,
            'institution': self.institution,
            'field_of_study': self.field_of_study,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'current': self.current,
            'description': self.description,
            'gpa': float(self.gpa) if self.gpa else None
        }

class Certification(db.Model):
    __tablename__ = 'certifications'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    issuer = db.Column(db.String(200), nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date)
    credential_id = db.Column(db.String(100))
    credential_url = db.Column(db.String(255))
    image = db.Column(db.String(255))
    description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'issuer': self.issuer,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'credential_id': self.credential_id,
            'credential_url': self.credential_url,
            'image': self.image,
            'description': self.description
        }

class Achievement(db.Model):
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    achievement_type = db.Column(db.String(50))  # award, competition, publication, etc.
    date = db.Column(db.Date, nullable=False)
    organization = db.Column(db.String(200))
    url = db.Column(db.String(255))
    image = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'achievement_type': self.achievement_type,
            'date': self.date.isoformat() if self.date else None,
            'organization': self.organization,
            'url': self.url,
            'image': self.image
        }

class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read': self.read
        }

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    image = db.Column(db.String(255))
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(10), default='draft')  # draft, published
    tags = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    
    author = db.relationship('User', backref=db.backref('blog_posts', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'image': self.image,
            'author': self.author.to_dict() if self.author else None,
            'status': self.status,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None
        }

# Add to_dict method to User model
User.to_dict = lambda self: {
    'id': self.id,
    'username': self.username,
    'email': self.email,
    'first_name': self.first_name,
    'last_name': self.last_name
}

# Routes - Frontend pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('index.html')

@app.route('/projects')
def projects():
    return render_template('index.html')

@app.route('/contact')
def contact():
    return render_template('index.html')

@app.route('/blog')
def blog():
    return render_template('index.html')

# API Routes
@app.route('/api/portfolio/', methods=['GET'])
def get_portfolio():
    """Get all portfolio data in one request"""
    try:
        profile = Profile.query.first()
        skills = Skill.query.all()
        projects = Project.query.filter_by(featured=True).all()
        experiences = Experience.query.order_by(Experience.start_date.desc()).all()
        education = Education.query.order_by(Education.start_date.desc()).all()
        certifications = Certification.query.order_by(Certification.issue_date.desc()).all()
        achievements = Achievement.query.order_by(Achievement.date.desc()).all()
        blog_posts = BlogPost.query.filter_by(status='published').order_by(BlogPost.published_at.desc()).limit(10).all()
        
        data = {
            'profile': profile.to_dict() if profile else None,
            'skills': [skill.to_dict() for skill in skills],
            'projects': [project.to_dict() for project in projects],
            'experiences': [exp.to_dict() for exp in experiences],
            'education': [edu.to_dict() for edu in education],
            'certifications': [cert.to_dict() for cert in certifications],
            'achievements': [ach.to_dict() for ach in achievements],
            'blog_posts': [post.to_dict() for post in blog_posts]
        }
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profiles/', methods=['GET'])
def get_profiles():
    """Get all profiles"""
    profiles = Profile.query.all()
    return jsonify([p.to_dict() for p in profiles])

@app.route('/api/skills/', methods=['GET'])
def get_skills():
    """Get all skills, optionally filtered by type"""
    skill_type = request.args.get('type')
    query = Skill.query
    if skill_type:
        query = query.filter_by(skill_type=skill_type)
    skills = query.order_by(Skill.proficiency.desc(), Skill.name).all()
    return jsonify([s.to_dict() for s in skills])

@app.route('/api/skills/grouped/', methods=['GET'])
def get_skills_grouped():
    """Get skills grouped by type"""
    tech_skills = Skill.query.filter_by(skill_type='tech').all()
    soft_skills = Skill.query.filter_by(skill_type='soft').all()
    tools = Skill.query.filter_by(skill_type='tool').all()
    languages = Skill.query.filter_by(skill_type='lang').all()
    
    data = {
        'technical': [s.to_dict() for s in tech_skills],
        'soft_skills': [s.to_dict() for s in soft_skills],
        'tools': [s.to_dict() for s in tools],
        'languages': [s.to_dict() for s in languages]
    }
    return jsonify(data)

@app.route('/api/projects/', methods=['GET'])
def get_projects():
    """Get all projects, optionally filtered by featured"""
    featured = request.args.get('featured')
    query = Project.query
    if featured:
        query = query.filter_by(featured=(featured.lower() == 'true'))
    projects = query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])

@app.route('/api/experiences/', methods=['GET'])
def get_experiences():
    """Get all experiences"""
    experiences = Experience.query.order_by(Experience.start_date.desc()).all()
    return jsonify([e.to_dict() for e in experiences])

@app.route('/api/education/', methods=['GET'])
def get_education():
    """Get all education"""
    education = Education.query.order_by(Education.start_date.desc()).all()
    return jsonify([e.to_dict() for e in education])

@app.route('/api/certifications/', methods=['GET'])
def get_certifications():
    """Get all certifications"""
    certifications = Certification.query.order_by(Certification.issue_date.desc()).all()
    return jsonify([c.to_dict() for c in certifications])

@app.route('/api/achievements/', methods=['GET'])
def get_achievements():
    """Get all achievements"""
    achievements = Achievement.query.order_by(Achievement.date.desc()).all()
    return jsonify([a.to_dict() for a in achievements])

@app.route('/api/blog/', methods=['GET'])
def get_blog_posts():
    """Get all published blog posts"""
    posts = BlogPost.query.filter_by(status='published')\
        .order_by(BlogPost.published_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])

@app.route('/api/contact/', methods=['POST'])
def submit_contact():
    """Handle contact form submission"""
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['name', 'email', 'subject', 'message']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        contact = Contact(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({'message': 'Message sent successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Initialize database
def init_db():
    """Initialize database tables and add sample data"""
    with app.app_context():
        db.create_all()
        
        # Check if data already exists
        user = User.query.first()
        if user is None:
            # Create a user
            user = User(
                username='tuananh',
                email='tuananh@example.com',
                first_name='Tuan',
                last_name='Anh'
            )
            db.session.add(user)
            db.session.flush()
            
            # Create profile
            profile = Profile(
                user_id=user.id,
                bio='Kỹ sư an toàn thông tin với niềm đam mê bảo mật ứng dụng web và cloud security.',
                location='Việt Nam',
                website='https://github.com/Tuan-Anh-IT'
            )
            db.session.add(profile)
        else:
            profile = Profile.query.filter_by(user_id=user.id).first()
        
        # Always add skills if they don't exist
        if Skill.query.count() == 0:
            # Create experiences first (needed for linking)
            exp1 = Experience(
                title='AppSec Engineer',
                company='Công ty ABC',
                location='Hà Nội, Việt Nam',
                start_date=datetime(2023, 1, 1).date(),
                end_date=datetime(2024, 12, 31).date(),
                current=False,
                description='Thực hiện penetration testing cho các ứng dụng web và mobile. Phát triển các tool tự động hóa quét lỗ hổng bảo mật. Tham gia thiết kế và triển khai các biện pháp bảo mật cho hệ thống cloud.'
            )
            db.session.add(exp1)
            
            exp2 = Experience(
                title='Security Intern',
                company='Công ty XYZ',
                location='Hồ Chí Minh, Việt Nam',
                start_date=datetime(2022, 6, 1).date(),
                end_date=datetime(2022, 12, 31).date(),
                current=False,
                description='Hỗ trợ team bảo mật trong việc phân tích malware và điều tra sự cố an ninh. Học hỏi và áp dụng các kỹ thuật bảo mật mới nhất.'
            )
            db.session.add(exp2)
            
            db.session.flush()
            
            # Create skills (Tech Stack)
            skill1 = Skill(name='Python', skill_type='tech', icon='🐍', proficiency=85)
            skill2 = Skill(name='React', skill_type='tech', icon='⚛️', proficiency=75)
            skill3 = Skill(name='Node.js', skill_type='tech', icon='🟢', proficiency=80)
            skill4 = Skill(name='Flask', skill_type='tech', icon='🌶️', proficiency=85)
            skill5 = Skill(name='HTML5', skill_type='tech', icon='📄', proficiency=90)
            skill6 = Skill(name='CSS3', skill_type='tech', icon='🎨', proficiency=85)
            skill7 = Skill(name='JavaScript', skill_type='tech', icon='📜', proficiency=80)
            skill8 = Skill(name='TypeScript', skill_type='tech', icon='📘', proficiency=75)
            skill9 = Skill(name='Penetration Testing', skill_type='tech', icon='🔒', proficiency=85)
            skill10 = Skill(name='Web Security', skill_type='tech', icon='🛡️', proficiency=90)
            skill11 = Skill(name='Cloud Security', skill_type='tech', icon='☁️', proficiency=80)
            skill12 = Skill(name='SQL', skill_type='tech', icon='💾', proficiency=75)
            
            # Create skills (Tools)
            skill13 = Skill(name='Burp Suite', skill_type='tool', icon='🛠️', proficiency=90)
            skill14 = Skill(name='Nmap', skill_type='tool', icon='🔍', proficiency=85)
            skill15 = Skill(name='Wireshark', skill_type='tool', icon='📡', proficiency=80)
            skill16 = Skill(name='Metasploit', skill_type='tool', icon='💣', proficiency=75)
            skill17 = Skill(name='Kali Linux', skill_type='tool', icon='🐉', proficiency=85)
            skill18 = Skill(name='Grafana', skill_type='tool', icon='📊', proficiency=70)
            skill19 = Skill(name='Git', skill_type='tool', icon='🔀', proficiency=85)
            skill20 = Skill(name='Docker', skill_type='tool', icon='🐳', proficiency=75)
            skill21 = Skill(name='AWS', skill_type='tool', icon='☁️', proficiency=80)
            skill22 = Skill(name='Jenkins', skill_type='tool', icon='🤖', proficiency=70)
            
            db.session.add_all([skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10,
                               skill11, skill12, skill13, skill14, skill15, skill16, skill17, skill18, skill19,
                               skill20, skill21, skill22])
            db.session.flush()
            
            # Link skills to experiences
            exp1.skills_used.append(skill1)
            exp1.skills_used.append(skill9)
            exp1.skills_used.append(skill10)
            exp1.skills_used.append(skill11)
            exp1.skills_used.append(skill13)
            exp1.skills_used.append(skill14)
            exp1.skills_used.append(skill21)
            
            exp2.skills_used.append(skill1)
            exp2.skills_used.append(skill14)
            exp2.skills_used.append(skill15)
            exp2.skills_used.append(skill16)
            exp2.skills_used.append(skill17)
            
            # Create education
            edu1 = Education(
                degree='Cử nhân An toàn Thông tin',
                institution='Đại học Bách Khoa Hà Nội',
                field_of_study='An toàn Thông tin',
                start_date=datetime(2019, 9, 1).date(),
                end_date=datetime(2023, 6, 30).date(),
                current=False,
                description='Tốt nghiệp với GPA 3.5/4.0. Chuyên ngành An toàn Thông tin, tập trung vào bảo mật ứng dụng web, penetration testing và incident response.',
                gpa=3.5
            )
            db.session.add(edu1)
            
            edu2 = Education(
                degree='Chứng chỉ CCNA Security',
                institution='Cisco Networking Academy',
                field_of_study='Network Security',
                start_date=datetime(2022, 1, 1).date(),
                end_date=datetime(2022, 6, 30).date(),
                current=False,
                description='Hoàn thành khóa học CCNA Security với chứng nhận từ Cisco Networking Academy. Tập trung vào bảo mật mạng và firewall configuration.'
            )
            db.session.add(edu2)
            
            edu3 = Education(
                degree='Khóa học Ethical Hacking',
                institution='Cybrary',
                field_of_study='Penetration Testing',
                start_date=datetime(2023, 3, 1).date(),
                end_date=datetime(2023, 8, 31).date(),
                current=False,
                description='Hoàn thành khóa học Ethical Hacking nâng cao, bao gồm web application penetration testing, network penetration testing và exploit development.'
            )
            db.session.add(edu3)
            
            db.session.commit()
            return  # Skills and related data added, exit early
        
        # If we reach here, data already exists - skills were already added
        return

# Run the app
if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)

