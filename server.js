const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user store
const users = [
	{ email: 'user@company.com', password: 'test123', name: 'Valued User' }
];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'replace-this-with-a-secure-secret',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 1000 * 60 * 60 }
}));

function requireAuth(req, res, next) {
	if (req.session && req.session.user) return next();
	return res.redirect('/');
}

app.get('/', (req, res) => {
	// login page is landing
	res.render('login', { error: null });
});

app.post('/login', (req, res) => {
	const { email, password } = req.body;
	const user = users.find(u => u.email === email && u.password === password);
	if (!user) {
		return res.status(401).render('login', { error: 'Invalid credentials' });
	}
	req.session.user = { email: user.email, name: user.name };
	res.redirect('/home');
});

app.get('/home', requireAuth, (req, res) => {
	res.render('home', { user: req.session.user, active: 'home' });
});

app.get('/products', requireAuth, (req, res) => {
	// read images from public/images
	const imgDir = path.join(__dirname, 'public', 'images');
	const fs = require('fs');
	let images = [];
	try {
		images = fs.readdirSync(imgDir).filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
	} catch (e) {
		images = [];
	}
	res.render('products', { user: req.session.user, images, active: 'products' });
});

app.post('/logout', (req, res) => {
	req.session.destroy(() => {
		res.clearCookie('connect.sid');
		res.redirect('/');
	});
});

// Fallback for other routes
app.use((req, res) => res.redirect('/'));

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
