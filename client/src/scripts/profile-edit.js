console.log('Profile Edit Script Loaded!');

let cropper = null;
let profilePictureBlob = null; // Store blob to upload later


// Load profile data on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired');
    await loadProfileData();
    setupFormHandlers();
    setupTabNavigation();
    trackFormChanges(); // Track if anything changed
});

let formChanged = false;

function trackFormChanges() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const initialState = new FormData(form);

    form.addEventListener('input', () => {
        formChanged = true;
    });

    // Handle discard button
    const discardBtn = document.querySelector('.form-sticky-footer .btn-secondary');
    if (discardBtn) {
        discardBtn.onclick = (e) => {
            e.preventDefault();
            if (formChanged || profilePictureBlob) {
                if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                window.location.href = 'dashboard.html';
            }
        };
    }
}

// Load existing profile data
// Load existing profile data
async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Failed to load profile');
        }

        const data = await response.json();
        if (data.success && data.user) {
            populateForm(data.user);
            updateProgress(data.completionPercentage || 0);
            updateSidebarPreview(data.user);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// Populate form with user data
function populateForm(user) {
    // Personal Information
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.dateOfBirth) document.getElementById('dateOfBirth').value = user.dateOfBirth.split('T')[0];
    if (user.bloodGroup) document.getElementById('bloodGroup').value = user.bloodGroup;
    if (user.gender) document.getElementById('gender').value = user.gender;

    // Academic Details
    if (user.department) document.getElementById('department').value = user.department;
    if (user.batch) document.getElementById('batch').value = user.batch;
    if (user.studentType) document.getElementById('studentType').value = user.studentType;
    if (user.currentCGPA) document.getElementById('currentCGPA').value = user.currentCGPA;
    if (user.targetCGPA) document.getElementById('targetCGPA').value = user.targetCGPA;
    if (user.completedCredits) document.getElementById('completedCredits').value = user.completedCredits;
    if (user.expectedGraduation) document.getElementById('expectedGraduation').value = user.expectedGraduation.split('T')[0].substring(0, 7);

    // Skills & Interests
    if (user.programmingLanguages && user.programmingLanguages.length > 0) {
        user.programmingLanguages.forEach(lang => {
            const checkbox = document.querySelector(`#programming-languages input[value="${lang}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    if (user.areasOfInterest && user.areasOfInterest.length > 0) {
        user.areasOfInterest.forEach(interest => {
            const checkbox = document.querySelector(`#areas-of-interest input[value="${interest}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    if (user.githubProfile) document.getElementById('githubProfile').value = user.githubProfile;
    if (user.linkedinProfile) document.getElementById('linkedinProfile').value = user.linkedinProfile;

    // Emergency Contact
    if (user.guardianName) document.getElementById('guardianName').value = user.guardianName;
    if (user.guardianPhone) document.getElementById('guardianPhone').value = user.guardianPhone;
    if (user.guardianRelationship) document.getElementById('guardianRelationship').value = user.guardianRelationship;

    // Profile Picture
    if (user.profilePicture) {
        document.getElementById('profile-preview').src = user.profilePicture;
    }
}

// Setup form handlers
function setupFormHandlers() {
    // Profile picture upload
    const uploadBtn = document.getElementById('upload-picture-btn');
    const fileInput = document.getElementById('profile-picture-input');
    const preview = document.getElementById('profile-preview');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                showNotification('Only JPG and PNG files are allowed', 'error');
                return;
            }

            // Read file for cropping
            const reader = new FileReader();
            reader.onload = (e) => {
                const cropModal = document.getElementById('crop-modal');
                const cropImage = document.getElementById('crop-image');

                cropImage.src = e.target.result;
                cropModal.classList.add('active');

                // Initialize Cropper
                if (cropper) {
                    cropper.destroy();
                }

                setTimeout(() => {
                    cropper = new Cropper(cropImage, {
                        aspectRatio: 1,
                        viewMode: 2,
                        guides: true,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                    });
                }, 100);
            };
            reader.readAsDataURL(file);
        });
    }

    // Modal Action Handlers
    const closeCropBtn = document.getElementById('close-crop');
    const cancelCropBtn = document.getElementById('cancel-crop');
    const saveCropBtn = document.getElementById('save-crop');
    const cropModal = document.getElementById('crop-modal');

    const closeCropModal = () => {
        cropModal.classList.remove('active');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    if (closeCropBtn) closeCropBtn.addEventListener('click', closeCropModal);
    if (cancelCropBtn) cancelCropBtn.addEventListener('click', closeCropModal);

    if (saveCropBtn) {
        saveCropBtn.addEventListener('click', async () => {
            if (!cropper) return;

            // Get cropped data
            const canvas = cropper.getCroppedCanvas({
                width: 400,
                height: 400
            });

            canvas.toBlob((blob) => {
                if (!blob) return;

                // Save blob for later upload
                profilePictureBlob = blob;

                // Update UI Previews (Locally only)
                const dataURL = canvas.toDataURL('image/jpeg');

                const preview = document.getElementById('profile-preview');
                if (preview) preview.src = dataURL;

                const sidebarPreview = document.getElementById('tab-profile-preview');
                if (sidebarPreview) sidebarPreview.src = dataURL;

                const globalAvatar = document.getElementById('global-sidebar-avatar');
                if (globalAvatar) {
                    globalAvatar.innerHTML = `<img src="${dataURL}" alt="Avatar">`;
                }

                // Show notification but don't upload yet
                showNotification('Picture cropped successfully! Please click "Save Changes" at the bottom to upload.', 'info');
                closeCropModal();
            }, 'image/jpeg');
        });
    }

    // Form submission
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
    }

    // Delete Account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('⚠️ ARE YOU SURE? ⚠️\n\nThis will permanently delete your account and all your data. This action cannot be undone.\n\nClick OK to confirm deletion.')) {
                await deleteAccount();
            }
        });
    }
}

// Delete Account Function
async function deleteAccount() {
    try {
        const response = await fetch('/api/user', {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Account deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Deletion failed');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showNotification('Failed to delete account', 'error');
    }
}

// Upload profile picture
async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await fetch('/api/profile/picture', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Picture upload failed');
    }
    return data;
}

// Save profile
async function saveProfile() {
    const submitBtn = document.querySelector('#profile-form button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Save Changes';

    try {
        console.log('Starting profile save...');

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            showNotification('Saving your profile changes...', 'info');
        }

        // 1. Upload profile picture if one was selected
        if (profilePictureBlob) {
            const croppedFile = new File([profilePictureBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
            await uploadProfilePicture(croppedFile);
            profilePictureBlob = null; // Clear after upload
        }

        // Collect form data
        const formData = {
            phone: document.getElementById('phone')?.value || '',
            dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
            bloodGroup: document.getElementById('bloodGroup')?.value || '',
            gender: document.getElementById('gender')?.value || '',
            department: document.getElementById('department')?.value || '',
            batch: document.getElementById('batch')?.value || '',
            studentType: document.getElementById('studentType')?.value || '',
            currentCGPA: parseFloat(document.getElementById('currentCGPA')?.value) || 0,
            targetCGPA: parseFloat(document.getElementById('targetCGPA')?.value) || 0,
            completedCredits: parseInt(document.getElementById('completedCredits')?.value) || 0,
            expectedGraduation: document.getElementById('expectedGraduation')?.value || '',
            githubProfile: document.getElementById('githubProfile')?.value || '',
            linkedinProfile: document.getElementById('linkedinProfile')?.value || '',
            guardianName: document.getElementById('guardianName')?.value || '',
            guardianPhone: document.getElementById('guardianPhone')?.value || '',
            guardianRelationship: document.getElementById('guardianRelationship')?.value || ''
        };

        console.log('Collected Form Data:', formData);

        // Collect programming languages
        const programmingLanguages = [];
        document.querySelectorAll('#programming-languages input:checked').forEach(checkbox => {
            programmingLanguages.push(checkbox.value);
        });
        formData.programmingLanguages = programmingLanguages;

        // Collect areas of interest
        const areasOfInterest = [];
        document.querySelectorAll('#areas-of-interest input:checked').forEach(checkbox => {
            areasOfInterest.push(checkbox.value);
        });
        formData.areasOfInterest = areasOfInterest;

        // Send to server
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.success) {
            showNotification('Profile updated successfully!', 'success');
            if (data.completionPercentage !== undefined) {
                updateProgress(data.completionPercentage);
            }

            // Update sidebar preview if user data returned
            if (data.user) {
                updateSidebarPreview(data.user);
            }

            // Reset button after successful save
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }

            formChanged = false; // Reset change tracker
        } else {
            throw new Error(data.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification(error.message || 'Failed to save profile', 'error');

        // Reset button on error
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Update progress bar
function updateProgress(percentage) {
    const progressFillSidebar = document.getElementById('progress-fill-sidebar');
    const progressTextPercent = document.getElementById('progress-text-percent');

    if (progressFillSidebar) {
        progressFillSidebar.style.width = percentage + '%';

        // Dynamic colors
        if (percentage < 30) progressFillSidebar.style.background = '#ef4444';
        else if (percentage < 70) progressFillSidebar.style.background = '#f59e0b';
        else progressFillSidebar.style.background = 'var(--primary-gradient)';
    }

    if (progressTextPercent) {
        progressTextPercent.textContent = percentage + '%';
    }
}

// Update sidebar preview info
function updateSidebarPreview(user) {
    const previewName = document.getElementById('preview-user-name');
    const previewId = document.getElementById('preview-user-id');
    const previewImg = document.getElementById('tab-profile-preview');

    // Global sidebar elements
    const globalSidebarName = document.getElementById('sidebar-user-name');
    const globalSidebarId = document.getElementById('sidebar-user-id');

    if (previewName) previewName.textContent = user.name || 'Anonymous Student';
    if (previewId) previewId.textContent = `ID: ${user.universityId || 'N/A'}`;
    if (previewImg && user.profilePicture) {
        previewImg.src = user.profilePicture;
    }

    // Sync global sidebar if present
    if (globalSidebarName) globalSidebarName.textContent = user.name || 'Student';
    if (globalSidebarId) globalSidebarId.textContent = user.universityId || 'ID: Loading...';

    // Update global avatar icon to image
    const globalAvatar = document.getElementById('global-sidebar-avatar');
    if (globalAvatar && user.profilePicture) {
        globalAvatar.innerHTML = `<img src="${user.profilePicture}" alt="Avatar">`;
    }
}

// Setup Tab Navigation
function setupTabNavigation() {
    const triggers = document.querySelectorAll('.tab-trigger');
    const panels = document.querySelectorAll('.tab-panel');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');

            // Update triggers
            triggers.forEach(t => t.classList.remove('active'));
            trigger.classList.add('active');

            // Update panels
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetTab) {
                    p.classList.add('active');
                }
            });

            // Scroll to top of content area on mobile
            if (window.innerWidth <= 1024) {
                document.querySelector('.profile-content-area').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Show notification
// End of profile-edit.js
