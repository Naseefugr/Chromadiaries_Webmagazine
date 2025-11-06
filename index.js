// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRuZdeaUSI3pu3-YdPlMSgApxwO3GknOQ",
    authDomain: "chromadiaries-d7f14.firebaseapp.com",
    databaseURL: "https://chromadiaries-d7f14-default-rtdb.firebaseio.com",
    projectId: "chromadiaries-d7f14",
    storageBucket: "chromadiaries-d7f14.firebasestorage.app",
    messagingSenderId: "637524482274",
    appId: "1:637524482274:web:603eb6026f810b59efe6bb",
    measurementId: "G-YQPQ8W2DTQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// DOM Elements
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const loginLink = document.getElementById('loginLink');
const signupLink = document.getElementById('signupLink');
const createWritingLink = document.getElementById('createWritingLink');
const dashboardLink = document.getElementById('dashboardLink');
const logoutLink = document.getElementById('logoutLink');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const successMessage = document.getElementById('successMessage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const writingForm = document.getElementById('writingForm');
const profileForm = document.getElementById('profileForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const showMoreBtn = document.getElementById('showMoreBtn');
const categoryShowMoreBtn = document.getElementById('categoryShowMoreBtn');
const searchShowMoreBtn = document.getElementById('searchShowMoreBtn');
const mobileNavToggle = document.getElementById('mobileNavToggle');
const mobileNavMenu = document.getElementById('mobileNavMenu');

// Page Elements
const homePage = document.getElementById('homePage');
const aboutPage = document.getElementById('aboutPage');
const categoryPage = document.getElementById('categoryPage');
const contactPage = document.getElementById('contactPage');
const createWritingPage = document.getElementById('createWritingPage');
const dashboardPage = document.getElementById('dashboardPage');
const authorDashboardPage = document.getElementById('authorDashboardPage');
const articlePage = document.getElementById('articlePage');
const searchResultsPage = document.getElementById('searchResultsPage');

// State
let currentUser = null;
let currentPage = 'home';
let currentCategory = '';
let writings = [];
let displayedWritings = 9;
let categoryDisplayedWritings = 9;
let searchDisplayedWritings = 9;
let searchResults = [];
let searchQuery = '';
let profileImageUrl = '';
let currentWritingId = null;
let userLikes = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;

            // Update UI for logged in user
            loginLink.classList.add('hidden');
            signupLink.classList.add('hidden');
            createWritingLink.classList.remove('hidden');
            dashboardLink.classList.remove('hidden');
            logoutLink.classList.remove('hidden');

            // Load user data
            loadUserData();
            loadUserEngagement();
        } else {
            currentUser = null;

            // Update UI for logged out user
            loginLink.classList.remove('hidden');
            signupLink.classList.remove('hidden');
            createWritingLink.classList.add('hidden');
            dashboardLink.classList.add('hidden');
            logoutLink.classList.add('hidden');
        }
    });

    // Load initial data
    loadWritings();

    // Set up slideshow
    setupSlideshow();

    // Set up rich text editor
    setupRichTextEditor();

    // Set up image upload
    setupImageUpload();

    // Set up likes
    setupEngagement();
});

// Mobile Navigation Toggle
mobileNavToggle.addEventListener('click', () => {
    mobileNavMenu.classList.toggle('show');
});

// Profile Dropdown
profileBtn.addEventListener('click', () => {
    profileMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('show');
    }
});

// Profile Menu Links
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.show();
});

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.show();
});

createWritingLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('createWriting');
});

dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('dashboard');
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        showPage('home');
    });
});

// Rich Text Editor Setup
function setupRichTextEditor() {
    const editorButtons = document.querySelectorAll('.editor-btn');
    const editorSelects = document.querySelectorAll('.editor-select');

    editorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.getAttribute('data-command');

            if (command === 'createLink') {
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else if (command === 'insertImage') {
                const url = prompt('Enter the image URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }

            document.getElementById('writingContent').focus();
        });
    });

    editorSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const command = select.getAttribute('data-command');
            const value = select.value;

            if (value) {
                document.execCommand(command, false, value);
                select.value = '';
            }

            document.getElementById('writingContent').focus();
        });
    });
}

// Image Upload Setup
function setupImageUpload() {
    // Writing image upload
    const writingImageUpload = document.getElementById('writingImageUpload');
    const writingImageFile = document.getElementById('writingImageFile');
    const writingImage = document.getElementById('writingImage');

    writingImageUpload.addEventListener('click', () => {
        writingImageFile.click();
    });

    writingImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file, (url) => {
                writingImage.value = url;
                writingImageUpload.classList.add('has-image');
                writingImageUpload.innerHTML = `
                            <img src="${url}" alt="Uploaded image" class="uploaded-image">
                            <div class="image-upload-overlay">
                                <i class="fas fa-camera"></i> Change Image
                            </div>
                        `;
            });
        }
    });

    // Profile picture upload in signup
    const signupProfileUploadBtn = document.getElementById('signupProfileUploadBtn');
    const signupProfilePicFile = document.getElementById('signupProfilePicFile');
    const signupProfilePic = document.getElementById('signupProfilePic');

    signupProfileUploadBtn.addEventListener('click', () => {
        signupProfilePicFile.click();
    });

    signupProfilePicFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                signupProfilePic.src = e.target.result;
                profileImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Profile picture upload in dashboard
    const profileUploadBtn = document.getElementById('profileUploadBtn');
    const profilePicFile = document.getElementById('profilePicFile');
    const profilePic = document.getElementById('profilePic');

    profileUploadBtn.addEventListener('click', () => {
        profilePicFile.click();
    });

    profilePicFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file, (url) => {
                profilePic.src = url;
                // Update user profile in database
                if (currentUser) {
                    database.ref('users/' + currentUser.uid).update({
                        profilePicture: url
                    });
                }
            });
        }
    });
}

// Upload Image to Firebase Storage
function uploadImage(file, callback) {
    const storageRef = storage.ref('images/' + Date.now() + '_' + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
        (snapshot) => {
            // Progress indicator can be added here
        },
        (error) => {
            console.error('Upload error:', error);
            alert('Image upload failed. Please try again.');
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                callback(downloadURL);
            });
        }
    );
}

// Setup Likes
function setupEngagement() {
    const likeBtn = document.getElementById('likeBtn');

    // Like button click
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('Please login to like articles');
                return;
            }

            if (!currentWritingId) return;

            const likeRef = database.ref('likes/' + currentWritingId + '/' + currentUser.uid);

            likeRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    // Unlike
                    likeRef.remove();
                    likeBtn.classList.remove('liked');
                } else {
                    // Like
                    likeRef.set({
                        userId: currentUser.uid,
                        timestamp: new Date().toISOString()
                    });
                    likeBtn.classList.add('liked');
                }
            });
        });
    }
}

// Load User Engagement Data
function loadUserEngagement() {
    if (!currentUser) return;

    // Load user's likes
    database.ref('likes').on('value', (snapshot) => {
        userLikes = {};
        const likes = snapshot.val();

        for (const writingId in likes) {
            for (const userId in likes[writingId]) {
                if (!userLikes[writingId]) {
                    userLikes[writingId] = [];
                }
                userLikes[writingId].push(userId);
            }
        }

        // Update like button if on article page
        if (currentWritingId && userLikes[currentWritingId]) {
            const likeBtn = document.getElementById('likeBtn');
            if (likeBtn && userLikes[currentWritingId].includes(currentUser.uid)) {
                likeBtn.classList.add('liked');
            }
        }
    });
}

// Login Form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Check for admin credentials
    if (email === 'admin' && password === 'alwan@24') {
        // Redirect to admin page
        window.location.href = 'admin.html';
        return;
    }

    // Regular user login with Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            loginModal.hide();
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
        });
});

// Sign Up Form - IMPROVED
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('signupFirstName').value;
    const surname = document.getElementById('signupSurname').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const bio = document.getElementById('signupBio').value;
    const website = document.getElementById('signupWebsite').value;
    const location = document.getElementById('signupLocation').value;
    const dob = document.getElementById('signupDOB').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Calculate age from DOB
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Check if user is at least 18 years old
    if (age < 18) {
        alert('You must be at least 18 years old to create an account.');
        return;
    }

    // Create user with Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Save user data to Firebase
            const userData = {
                firstName: firstName,
                surname: surname,
                email: email,
                phone: phone,
                bio: bio,
                website: website,
                location: location,
                dob: dob,
                profilePicture: profileImageUrl || `https://picsum.photos/seed/${email}/150/150.jpg`,
                createdAt: new Date().toISOString()
            };

            database.ref('users/' + userCredential.user.uid).set(userData);

            signupModal.hide();
            successMessage.textContent = 'Account created successfully!';
            successModal.show();
        })
        .catch(error => {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        });
});

// Writing Form - IMPROVED
writingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('writingTitle').value;
    const description = document.getElementById('writingDescription').value;
    const image = document.getElementById('writingImage').value || `https://picsum.photos/seed/${Date.now()}/400/300.jpg`;
    const content = document.getElementById('writingContent').innerHTML;
    const tags = document.getElementById('writingTags').value.split(',').map(tag => tag.trim());
    const category = document.getElementById('writingCategory').value;

    // Create writing object
    const writing = {
        title: title,
        description: description,
        image: image,
        content: content,
        tags: tags,
        category: category,
        author: currentUser.email,
        authorName: currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.surname || ''}` || currentUser.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0
    };

    // Submit to Formspree for admin review
    const form = document.createElement('form');
    form.action = 'https://formspree.io/f/xnnonkrk';
    form.method = 'POST';

    Object.keys(writing).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof writing[key] === 'object' ? JSON.stringify(writing[key]) : writing[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset form
    writingForm.reset();
    document.getElementById('writingContent').innerHTML = '';
    document.getElementById('writingImageUpload').classList.remove('has-image');
    document.getElementById('writingImageUpload').innerHTML = `
                <input type="file" id="writingImageFile" accept="image/*" style="display: none;">
                <div id="imageUploadPlaceholder">
                    <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Click to upload image or drag and drop</p>
                    <p class="text-muted small">PNG, JPG, GIF up to 10MB</p>
                </div>
                <div class="image-upload-overlay">
                    <i class="fas fa-camera"></i> Change Image
                </div>
            `;

    // Re-setup image upload
    setupImageUpload();

    // Show success message
    successMessage.textContent = 'Your writing has been submitted for review!';
    successModal.show();

    // Redirect to dashboard
    setTimeout(() => {
        showPage('dashboard');
    }, 2000);
});

// Profile Form - IMPROVED
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('profileFirstName').value;
    const surname = document.getElementById('profileSurname').value;
    const bio = document.getElementById('profileBio').value;
    const website = document.getElementById('profileWebsite').value;
    const location = document.getElementById('profileLocation').value;
    const phone = document.getElementById('profilePhone').value;

    // Update user profile in Firebase
    const updateData = {
        firstName: firstName,
        surname: surname,
        bio: bio,
        website: website,
        location: location,
        phone: phone,
        updatedAt: new Date().toISOString()
    };

    database.ref('users/' + currentUser.uid).update(updateData);

    // Update display name in Firebase Auth
    currentUser.updateProfile({
        displayName: `${firstName} ${surname}`
    });

    successMessage.textContent = 'Profile updated successfully!';
    successModal.show();
});

// Search Functionality
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchWritings(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchWritings(query);
        }
    }
});

// Show More Button
showMoreBtn.addEventListener('click', () => {
    displayedWritings = writings.length; // Show all writings
    displayWritings(writings);
    showMoreBtn.style.display = 'none'; // Hide button after showing all
});

// Category Show More Button
categoryShowMoreBtn.addEventListener('click', () => {
    categoryDisplayedWritings += 9;
    const categoryWritings = writings.filter(writing => writing.category === currentCategory);
    displayWritings(categoryWritings.slice(0, categoryDisplayedWritings), 'categoryWritings');

    if (categoryDisplayedWritings >= categoryWritings.length) {
        categoryShowMoreBtn.style.display = 'none';
    } else {
        categoryShowMoreBtn.style.display = 'block';
    }
});

// Search Show More Button
searchShowMoreBtn.addEventListener('click', () => {
    searchDisplayedWritings += 9;
    displayWritings(searchResults.slice(0, searchDisplayedWritings), 'searchResultsContainer');

    if (searchDisplayedWritings >= searchResults.length) {
        searchShowMoreBtn.style.display = 'none';
    } else {
        searchShowMoreBtn.style.display = 'block';
    }
});

// Page Navigation Functions
function showPage(page) {
    // Hide all pages
    homePage.classList.add('hidden');
    aboutPage.classList.add('hidden');
    categoryPage.classList.add('hidden');
    contactPage.classList.add('hidden');
    createWritingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
    authorDashboardPage.classList.add('hidden');
    articlePage.classList.add('hidden');
    searchResultsPage.classList.add('hidden');

    // Show selected page
    switch (page) {
        case 'home':
            homePage.classList.remove('hidden');
            currentPage = 'home';
            break;
        case 'about':
            aboutPage.classList.remove('hidden');
            currentPage = 'about';
            break;
        case 'contact':
            contactPage.classList.remove('hidden');
            currentPage = 'contact';
            break;
        case 'createWriting':
            createWritingPage.classList.remove('hidden');
            currentPage = 'createWriting';
            break;
        case 'dashboard':
            dashboardPage.classList.remove('hidden');
            currentPage = 'dashboard';
            loadUserWritings();
            updateDashboardStats();
            break;
        case 'article':
            articlePage.classList.remove('hidden');
            currentPage = 'article';
            break;
    }

    // Close profile menu
    profileMenu.classList.remove('show');

    // Close mobile menu
    mobileNavMenu.classList.remove('show');
}

function showCategoryPage(category) {
    // Hide all pages
    homePage.classList.add('hidden');
    aboutPage.classList.add('hidden');
    categoryPage.classList.add('hidden');
    contactPage.classList.add('hidden');
    createWritingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
    authorDashboardPage.classList.add('hidden');
    articlePage.classList.add('hidden');
    searchResultsPage.classList.add('hidden');

    // Show category page
    categoryPage.classList.remove('hidden');
    currentPage = 'category';
    currentCategory = category;
    categoryDisplayedWritings = 9;

    // Set category title
    const categoryTitle = document.getElementById('categoryTitle');
    switch (category) {
        case 'current-affairs':
            categoryTitle.textContent = 'Current Affairs';
            break;
        case 'society-culture':
            categoryTitle.textContent = 'Society & Culture';
            break;
        case 'science-technology':
            categoryTitle.textContent = 'Science & Technology';
            break;
        case 'opinion':
            categoryTitle.textContent = 'Opinion';
            break;
    }

    // Load category writings
    const categoryWritings = writings.filter(writing => writing.category === category);
    displayWritings(categoryWritings.slice(0, categoryDisplayedWritings), 'categoryWritings');

    // Show/hide show more button
    if (categoryWritings.length <= categoryDisplayedWritings) {
        categoryShowMoreBtn.style.display = 'none';
    } else {
        categoryShowMoreBtn.style.display = 'block';
    }

    // Close profile menu
    profileMenu.classList.remove('show');

    // Close mobile menu
    mobileNavMenu.classList.remove('show');
}

function showAuthorDashboard(authorEmail) {
    // Hide all pages
    homePage.classList.add('hidden');
    aboutPage.classList.add('hidden');
    categoryPage.classList.add('hidden');
    contactPage.classList.add('hidden');
    createWritingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
    authorDashboardPage.classList.remove('hidden');
    articlePage.classList.add('hidden');
    searchResultsPage.classList.add('hidden');

    currentPage = 'authorDashboard';

    // Load author data
    database.ref('users').once('value').then(snapshot => {
        const users = snapshot.val();
        let authorData = null;

        for (const userId in users) {
            if (users[userId].email === authorEmail) {
                authorData = users[userId];
                break;
            }
        }

        if (authorData) {
            document.getElementById('authorName').textContent = `${authorData.firstName || ''} ${authorData.surname || ''}` || authorData.email;
            document.getElementById('authorBio').textContent = authorData.bio || 'No bio available.';
            if (authorData.profilePicture) {
                document.getElementById('authorPic').src = authorData.profilePicture;
            }
        } else {
            document.getElementById('authorName').textContent = authorEmail;
            document.getElementById('authorBio').textContent = 'No bio available.';
        }
    });

    // Load author's writings
    const authorWritings = writings.filter(writing => writing.author === authorEmail && writing.status === 'published');
    displayWritings(authorWritings, 'authorWritings');

    // Close profile menu
    profileMenu.classList.remove('show');

    // Close mobile menu
    mobileNavMenu.classList.remove('show');
}

// Data Loading Functions
function loadWritings() {
    database.ref('writings').once('value').then(snapshot => {
        const data = snapshot.val();
        writings = [];

        for (const id in data) {
            writings.push({
                id: id,
                ...data[id]
            });
        }

        // Sort by creation date (newest first)
        writings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Display writings on home page
        displayWritings(writings.slice(0, displayedWritings));

        // Set up slideshow with latest writings
        setupSlideshowWithWritings();

        // Show/hide show more button
        if (writings.length <= displayedWritings) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'block';
        }
    });
}

function loadUserData() {
    if (currentUser) {
        database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
            const userData = snapshot.val();

            if (userData) {
                // Update profile form
                document.getElementById('profileFirstName').value = userData.firstName || '';
                document.getElementById('profileSurname').value = userData.surname || '';
                document.getElementById('profileEmail').value = userData.email || currentUser.email;
                document.getElementById('profilePhone').value = userData.phone || '';
                document.getElementById('profileBio').value = userData.bio || '';
                document.getElementById('profileWebsite').value = userData.website || '';
                document.getElementById('profileLocation').value = userData.location || '';

                // Update profile picture
                if (userData.profilePicture) {
                    document.getElementById('profilePic').src = userData.profilePicture;
                    // Update profile button to show user image instead of icon
                    profileBtn.innerHTML = `<img src="${userData.profilePicture}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
            }
        });
    }
}

function loadUserWritings() {
    if (currentUser) {
        const userWritings = writings.filter(writing => writing.author === currentUser.email);
        displayUserWritings(userWritings);
    }
}

// Update Dashboard Statistics
function updateDashboardStats() {
    if (currentUser) {
        const userWritings = writings.filter(writing => writing.author === currentUser.email);

        // Calculate real statistics from database
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;

        // Get likes and comments data
        database.ref('likes').once('value').then(likesSnapshot => {
            const likes = likesSnapshot.val();

            database.ref('comments').once('value').then(commentsSnapshot => {
                const comments = commentsSnapshot.val();

                userWritings.forEach(writing => {
                    totalViews += writing.views || 0;

                    // Count likes for this writing
                    if (likes && likes[writing.id]) {
                        totalLikes += Object.keys(likes[writing.id]).length;
                    }

                    // Count comments for this writing
                    if (comments && comments[writing.id]) {
                        totalComments += Object.keys(comments[writing.id]).length;
                    }
                });

                // Update UI
                document.getElementById('totalWritings').textContent = userWritings.length;
                document.getElementById('totalViews').textContent = totalViews;
                document.getElementById('totalLikes').textContent = totalLikes;
                document.getElementById('totalComments').textContent = totalComments;
            });
        });
    }
}

// Display Functions
function displayWritings(writingsToDisplay, containerId = 'recentWritings') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (writingsToDisplay.length === 0) {
        container.innerHTML = '<p class="text-center">No writings found.</p>';
        return;
    }

    writingsToDisplay.forEach(writing => {
        const articleCard = document.createElement('div');
        articleCard.className = 'col-md-4 mb-4';

        const categoryLabel = getCategoryLabel(writing.category);

        articleCard.innerHTML = `
                    <div class="article-card">
                        <img src="${writing.image}" alt="${writing.title}">
                        <div class="article-card-body">
                            <div class="article-category">${categoryLabel}</div>
                            <h5 class="article-title">${writing.title}</h5>
                            <p class="card-text">${writing.description}</p>
                            <div class="article-meta">
                                <div class="author-info">
                                    <img src="https://picsum.photos/seed/${writing.author}/35/35.jpg" alt="${writing.authorName}" class="author-avatar">
                                    <span>${writing.authorName || writing.author}</span>
                                </div>
                                <span>${formatDate(writing.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                `;

        // Add click event to article card
        articleCard.addEventListener('click', () => {
            viewWriting(writing);
        });

        container.appendChild(articleCard);
    });
}

function displayUserWritings(userWritings) {
    const container = document.getElementById('myWritings');
    container.innerHTML = '';

    if (userWritings.length === 0) {
        container.innerHTML = '<p>You haven\'t created any writings yet.</p>';
        return;
    }

    userWritings.forEach(writing => {
        const writingItem = document.createElement('div');
        writingItem.className = 'writing-item';

        // Get real-time likes count
        let likesCount = 0;

        if (userLikes[writing.id]) {
            likesCount = userLikes[writing.id].length;
        }

        writingItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${writing.title}</h5>
                            <p>${writing.description}</p>
                            <div>
                                <span class="status-published">Published</span>
                                <span class="ms-2">${getCategoryLabel(writing.category)}</span>
                                <span class="ms-2 text-muted">
                                    <i class="fas fa-eye"></i> ${writing.views || 0}
                                    <i class="fas fa-heart ms-2"></i> ${likesCount}
                                </span>
                            </div>
                        </div>
                        <div class="admin-actions">
                            <button class="btn btn-sm btn-outline-primary edit-writing" data-id="${writing.id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-writing" data-id="${writing.id}">Delete</button>
                        </div>
                    </div>
                `;

        container.appendChild(writingItem);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-writing').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const writingId = btn.getAttribute('data-id');
            editWriting(writingId);
        });
    });

    document.querySelectorAll('.delete-writing').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const writingId = btn.getAttribute('data-id');
            deleteWriting(writingId);
        });
    });
}

// Writing Actions
function viewWriting(writing) {
    // Hide all pages
    homePage.classList.add('hidden');
    aboutPage.classList.add('hidden');
    categoryPage.classList.add('hidden');
    contactPage.classList.add('hidden');
    createWritingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
    authorDashboardPage.classList.add('hidden');
    searchResultsPage.classList.add('hidden');

    // Show article page
    articlePage.classList.remove('hidden');

    // Set current writing ID
    currentWritingId = writing.id;

    // Populate article page with writing data
    document.getElementById('articleTitle').textContent = writing.title;
    document.getElementById('articleAuthor').textContent = writing.authorName || writing.author;
    document.getElementById('articleDate').textContent = formatDate(writing.createdAt);
    document.getElementById('articleCategory').textContent = getCategoryLabel(writing.category);
    document.getElementById('articleImage').src = writing.image;

    // Display content (HTML from rich text editor)
    document.getElementById('articleContent').innerHTML = writing.content;

    // Display tags
    const tagsContainer = document.getElementById('articleTags');
    tagsContainer.innerHTML = '';
    if (writing.tags && writing.tags.length > 0) {
        writing.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }

    // Set author avatar
    document.getElementById('articleAuthorAvatar').src = `https://picsum.photos/seed/${writing.author}/50/50.jpg`;

    // Update engagement counts
    const likesCount = userLikes[writing.id] ? userLikes[writing.id].length : 0;

    document.getElementById('likeCount').textContent = likesCount;

    // Update like button state
    const likeBtn = document.getElementById('likeBtn');
    if (currentUser && userLikes[writing.id] && userLikes[writing.id].includes(currentUser.uid)) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }

    // Update views count
    if (writing.id) {
        database.ref('writings/' + writing.id).update({
            views: (writing.views || 0) + 1
        });
    }

    // Update current page
    currentPage = 'article';

    // Close profile menu
    profileMenu.classList.remove('show');

    // Close mobile menu
    mobileNavMenu.classList.remove('show');
}

function editWriting(writingId) {
    // Find the writing
    const writing = writings.find(w => w.id === writingId);
    if (!writing) return;

    // Show create writing page with pre-filled data
    showPage('createWriting');

    // Fill the form with writing data
    document.getElementById('writingTitle').value = writing.title;
    document.getElementById('writingDescription').value = writing.description;
    document.getElementById('writingImage').value = writing.image;
    document.getElementById('writingContent').innerHTML = writing.content;
    document.getElementById('writingTags').value = writing.tags.join(', ');
    document.getElementById('writingCategory').value = writing.category;

    // Update image upload display
    if (writing.image) {
        const writingImageUpload = document.getElementById('writingImageUpload');
        writingImageUpload.classList.add('has-image');
        writingImageUpload.innerHTML = `
                    <input type="file" id="writingImageFile" accept="image/*" style="display: none;">
                    <img src="${writing.image}" alt="Uploaded image" class="uploaded-image">
                    <div class="image-upload-overlay">
                        <i class="fas fa-camera"></i> Change Image
                    </div>
                `;
    }

    // Re-setup image upload
    setupImageUpload();

    // Change form submission behavior
    writingForm.onsubmit = (e) => {
        e.preventDefault();

        // Update writing object
        const updatedWriting = {
            title: document.getElementById('writingTitle').value,
            description: document.getElementById('writingDescription').value,
            image: document.getElementById('writingImage').value,
            content: document.getElementById('writingContent').innerHTML,
            tags: document.getElementById('writingTags').value.split(',').map(tag => tag.trim()),
            category: document.getElementById('writingCategory').value,
            author: writing.author,
            authorName: writing.authorName,
            status: writing.status,
            createdAt: writing.createdAt,
            updatedAt: new Date().toISOString()
        };

        // Submit to Formspree for admin review
        const form = document.createElement('form');
        form.action = 'https://formspree.io/f/xnnonkrk';
        form.method = 'POST';

        Object.keys(updatedWriting).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = typeof updatedWriting[key] === 'object' ? JSON.stringify(updatedWriting[key]) : updatedWriting[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Reset form
        writingForm.reset();
        document.getElementById('writingContent').innerHTML = '';
        writingForm.onsubmit = null;

        // Show success message
        successMessage.textContent = 'Your writing has been updated and submitted for review!';
        successModal.show();

        // Redirect to dashboard
        setTimeout(() => {
            showPage('dashboard');
        }, 2000);
    };
}

function deleteWriting(writingId) {
    if (confirm('Are you sure you want to delete this writing?')) {
        // Submit deletion request to Formspree
        const form = document.createElement('form');
        form.action = 'https://formspree.io/f/xnnonkrk';
        form.method = 'POST';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'deleteWriting';
        input.value = writingId;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Show success message
        successMessage.textContent = 'Your deletion request has been submitted for review!';
        successModal.show();

        // Reload user writings
        loadUserWritings();
    }
}

// Search Function
function searchWritings(query) {
    searchQuery = query;
    searchDisplayedWritings = 9;

    const lowerQuery = query.toLowerCase();

    // Search in titles, authors, and tags
    searchResults = writings.filter(writing => {
        const titleMatch = writing.title.toLowerCase().includes(lowerQuery);
        const authorMatch = (writing.authorName || writing.author).toLowerCase().includes(lowerQuery);
        const tagsMatch = writing.tags && writing.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        const categoryMatch = writing.category && writing.category.toLowerCase().includes(lowerQuery);

        return titleMatch || authorMatch || tagsMatch || categoryMatch;
    });

    // Hide all pages
    homePage.classList.add('hidden');
    aboutPage.classList.add('hidden');
    categoryPage.classList.add('hidden');
    contactPage.classList.add('hidden');
    createWritingPage.classList.add('hidden');
    dashboardPage.classList.add('hidden');
    authorDashboardPage.classList.add('hidden');
    articlePage.classList.add('hidden');

    // Show search results page
    searchResultsPage.classList.remove('hidden');

    // Update search info
    document.getElementById('searchInfo').textContent = `Found ${searchResults.length} results for "${query}"`;

    // Display search results
    displayWritings(searchResults.slice(0, searchDisplayedWritings), 'searchResultsContainer');

    // Show/hide show more button
    if (searchResults.length <= searchDisplayedWritings) {
        searchShowMoreBtn.style.display = 'none';
    } else {
        searchShowMoreBtn.style.display = 'block';
    }

    // Update current page
    currentPage = 'searchResults';

    // Close profile menu
    profileMenu.classList.remove('show');

    // Close mobile menu
    mobileNavMenu.classList.remove('show');
}

// Slideshow Function
function setupSlideshow() {
    // This will be replaced by setupSlideshowWithWritings
}

// Setup Slideshow with Latest Writings
function setupSlideshowWithWritings() {
    const slideshow = document.getElementById('slideshow');
    const smallSlides = document.getElementById('smallSlides');

    // Clear existing slides
    slideshow.innerHTML = '';
    smallSlides.innerHTML = '';

    // Get the latest 3 writings for main slideshow
    const latestWritings = writings.slice(0, 3);

    // Create main slides
    latestWritings.forEach((writing, index) => {
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';

        slide.innerHTML = `
                    <img src="${writing.image}" alt="${writing.title}">
                    <div class="slide-content">
                        <h2>${writing.title}</h2>
                        <p>By ${writing.authorName || writing.author} • ${formatDate(writing.createdAt)}</p>
                    </div>
                `;

        slideshow.appendChild(slide);
    });

    // Get the next 2 writings for small slides
    const smallWritings = writings.slice(3, 5);

    // Create small slides
    smallWritings.forEach(writing => {
        const smallSlide = document.createElement('div');
        smallSlide.className = 'small-slide';

        smallSlide.innerHTML = `
                    <img src="${writing.image}" alt="${writing.title}">
                    <div class="small-slide-content">
                        <h5>${writing.title}</h5>
                        <p>By ${writing.authorName || writing.author}</p>
                    </div>
                `;

        smallSlide.addEventListener('click', () => {
            viewWriting(writing);
        });

        smallSlides.appendChild(smallSlide);
    });

    // Set up auto-rotation for main slides
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-rotate slides every 5 seconds
    setInterval(nextSlide, 5000);
}

// Utility Functions
function getCategoryLabel(category) {
    switch (category) {
        case 'current-affairs':
            return 'Current Affairs';
        case 'society-culture':
            return 'Society & Culture';
        case 'science-technology':
            return 'Science & Technology';
        case 'opinion':
            return 'Opinion';
        default:
            return category || 'Uncategorized';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}