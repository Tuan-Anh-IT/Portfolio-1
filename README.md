# TanhCyber Portfolio

Portfolio website được xây dựng với **Flask** backend và **HTML/CSS/JavaScript** frontend, bao gồm giao diện mobile responsive hoàn chỉnh.

## 🚀 Tính năng

- **Frontend**: HTML/CSS/JavaScript thuần với animations mượt mà
- **Backend**: Flask với SQLAlchemy ORM
- **Database**: SQLite (có thể thay đổi thành PostgreSQL/MySQL)
- **Responsive**: Tối ưu cho tất cả thiết bị mobile
- **API**: RESTful API đầy đủ với CORS support

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Python 3.8+
- pip (Python package manager)

### Backend (Flask)

1. **Tạo virtual environment (khuyến nghị):**
```bash
cd Profiles
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

2. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

3. **Khởi tạo database:**
```bash
python app.py
```

Lần đầu chạy, Flask sẽ tự động tạo database `portfolio.db` với các bảng cần thiết.

4. **Chạy server:**
```bash
python app.py
```

Server sẽ chạy tại `http://localhost:5000`

## 📁 Cấu trúc dự án

```
Profiles/
├── app.py                  # Flask application chính
├── requirements.txt        # Python dependencies
├── portfolio.db            # SQLite database (tự động tạo)
├── templates/              # HTML templates
│   └── index.html          # Template chính
├── static/                 # Static files
│   ├── css/
│   │   └── style.css       # CSS styles
│   ├── js/
│   │   └── app.js          # JavaScript logic
│   ├── images/             # Hình ảnh
│   └── documents/          # Tài liệu (CV, etc.)
└── README.md
```

## 🗄️ Cấu trúc Database

### Models chính:
- **User**: Người dùng
- **Profile**: Thông tin cá nhân
- **Skill**: Kỹ năng và công nghệ
- **Project**: Dự án portfolio
- **Experience**: Kinh nghiệm làm việc
- **Education**: Học vấn và chứng chỉ
- **Contact**: Form liên hệ
- **BlogPost**: Bài viết blog

## 🔌 API Endpoints

### Frontend Routes:
- `GET /` - Trang chủ
- `GET /about` - Trang giới thiệu
- `GET /projects` - Trang dự án
- `GET /contact` - Trang liên hệ
- `GET /blog` - Trang blog

### API Routes:
- `GET /api/portfolio/` - Lấy tất cả dữ liệu portfolio (profile, skills, projects, experiences, education)
- `GET /api/profiles/` - Lấy danh sách profiles
- `GET /api/skills/` - Lấy danh sách skills (có thể filter theo `?type=tech`)
- `GET /api/skills/grouped/` - Lấy skills nhóm theo loại
- `GET /api/projects/` - Lấy danh sách projects (có thể filter theo `?featured=true`)
- `GET /api/experiences/` - Lấy danh sách experiences
- `GET /api/education/` - Lấy danh sách education
- `GET /api/blog/` - Lấy danh sách blog posts đã published
- `POST /api/contact/` - Gửi form liên hệ

## 🎨 Customization

### Thay đổi theme:
- Chỉnh sửa CSS variables trong `static/css/style.css`
- Màu sắc chính: `--primary`, `--bg`, `--text`

### Thêm nội dung:
Sử dụng Python shell để thêm dữ liệu:

```python
python
from app import app, db
from app import User, Profile, Skill, Project, Experience, Education

with app.app_context():
    # Tạo user
    user = User(username='tuananh', email='contact@tanhcyber.com', 
                first_name='Tuan', last_name='Anh')
    db.session.add(user)
    db.session.commit()
    
    # Tạo profile
    profile = Profile(user_id=user.id, bio='Kỹ sư an toàn thông tin...', 
                     location='Hà Nội, Việt Nam')
    db.session.add(profile)
    db.session.commit()
    
    # Tạo skill
    skill = Skill(name='Python', skill_type='tech', proficiency=90, 
                 icon='🐍', description='Programming language')
    db.session.add(skill)
    db.session.commit()
    
    # Tạo project
    project = Project(title='KhoDeAzota', description='Trang web lưu trữ đề thi...',
                    url='https://khodeazota.id.vn/', featured=True)
    db.session.add(project)
    db.session.commit()
```

## 📱 Mobile Optimization

### Responsive Features:
- Flexible grid layouts
- Mobile navigation menu
- Touch-friendly interactions
- Optimized typography
- Fast loading trên mobile

### Performance:
- Lazy loading images
- Optimized bundle size
- Efficient animations
- Mobile-first CSS

## 🚀 Deployment

### Production Settings:

1. **Cập nhật `app.py`:**
```python
app.config['DEBUG'] = False
app.config['SECRET_KEY'] = 'your-production-secret-key-here'
```

2. **Cấu hình database production:**
```python
# PostgreSQL example
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/dbname'
```

3. **Sử dụng production server:**
```bash
# Sử dụng gunicorn (cài đặt: pip install gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Hosting:
- Flask: PythonAnywhere, Heroku, DigitalOcean, AWS, Azure
- Static files: Có thể serve trực tiếp từ Flask hoặc CDN

## 🔧 Development

### Cấu trúc thư mục:
```
Profiles/
├── app.py                  # Flask app với models và routes
├── templates/              # HTML templates
│   └── index.html
├── static/                 # Static assets
│   ├── css/
│   ├── js/
│   ├── images/
│   └── documents/
└── requirements.txt
```

### Scripts hữu ích:
```bash
# Chạy development server
python app.py

# Tạo database mới
rm portfolio.db
python app.py

# Kiểm tra migrations (nếu dùng Flask-Migrate)
flask db upgrade
```

## 🔄 Migration từ Django sang Flask

Dự án này đã được chuyển đổi từ Django sang Flask. Những thay đổi chính:

1. **Backend**: Django → Flask
2. **ORM**: Django ORM → SQLAlchemy
3. **Templates**: Django Templates → Jinja2 (Flask)
4. **Frontend**: React.js → Vanilla JavaScript
5. **API**: Django REST Framework → Flask routes với JSON responses

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi:
- Email: contact@tanhcyber.com
- GitHub: [Tuan-Anh-IT](https://github.com/Tuan-Anh-IT)

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
