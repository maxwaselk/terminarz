document.addEventListener('DOMContentLoaded', () => {
    const meetingForm = document.getElementById('meetingForm');
    const meetingList = document.getElementById('meetingList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = editModal.querySelector('.close-btn');
    const editForm = document.getElementById('editForm');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    const notification = document.getElementById('notification');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('nav-links');

    let currentEditId = null;
    let meetingToDelete = null;

    // Firebase configuration (replace with your own)
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Check and request notification permissions
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Uprawnienia do powiadomień przyznane.');
                navigator.serviceWorker.ready.then(registration => {
                    messaging.useServiceWorker(registration);
                });
            }
        });
    }

    // Load meetings from localStorage
    const loadMeetings = () => {
        renderMeetingList();
    };

    // Save meetings to localStorage
    const saveMeetings = (meetings) => {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Handle adding a new meeting
    meetingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const purpose = document.getElementById('purpose').value.trim();

        if (validateForm(name, date, time, purpose)) {
            const meeting = {
                id: Date.now(),
                name,
                date,
                time,
                purpose
            };

            addMeetingToList(meeting);
            let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
            meetings.push(meeting);
            saveMeetings(meetings);

            // Reset form
            meetingForm.reset();

            // Show success notification
            showNotification('Spotkanie zostało dodane pomyślnie!', 'success');
        } else {
            showNotification('Wystąpił błąd podczas dodawania spotkania.', 'error');
        }
    });

    // Validate form inputs
    const validateForm = (name, date, time, purpose) => {
        const errors = [];

        if (name.length < 3) {
            errors.push('Imię i nazwisko musi mieć co najmniej 3 znaki.');
        }

        if (!isValidDate(date)) {
            errors.push('Data musi być poprawna i nie może być w przeszłości.');
        }

        if (!isValidTime(time)) {
            errors.push('Godzina musi być poprawna.');
        }

        if (purpose.length < 5) {
            errors.push('Cel spotkania musi mieć co najmniej 5 znaków.');
        }

        if (errors.length > 0) {
            alert(errors.join('\n')); // Alternatively, use showNotification
            return false;
        }

        return true;
    };

    // Check if date is valid and not in the past
    const isValidDate = (dateStr) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const meetingDate = new Date(dateStr);
        return meetingDate >= today;
    };

    // Check if time is valid (24-hour format)
    const isValidTime = (timeStr) => {
        return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
    };

    // Add meeting to the list in UI
    const addMeetingToList = (meeting) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', meeting.id);

        const detailsDiv = document.createElement('div');
        detailsDiv.innerHTML = `
            <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
            <p><span>Data:</span> ${formatDate(meeting.date)}</p>
            <p><span>Godzina:</span> ${meeting.time}</p>
            <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
        `;

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edytuj Spotkanie';
        editBtn.addEventListener('click', () => openEditModal(meeting));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Usuń Spotkanie';
        deleteBtn.addEventListener('click', () => handleRemove(meeting));

        actionButtons.appendChild(editBtn);
        actionButtons.appendChild(deleteBtn);

        li.appendChild(detailsDiv);
        li.appendChild(actionButtons);
        meetingList.prepend(li); // Add to top of list

        // Add event to calendar
        addEventToCalendar(meeting);
    };

    // Format date to readable string in Polish
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL', options);
    };

    // Open edit modal with meeting data
    const openEditModal = (meeting) => {
        currentEditId = meeting.id;
        document.getElementById('editName').value = meeting.name;
        document.getElementById('editDate').value = meeting.date;
        document.getElementById('editTime').value = meeting.time;
        document.getElementById('editPurpose').value = meeting.purpose;
        editModal.style.display = 'block';
        editModal.setAttribute('aria-hidden', 'false');
    };

    // Close edit modal
    const closeEditModal = () => {
        editModal.style.display = 'none';
        editForm.reset();
        currentEditId = null;
        editModal.setAttribute('aria-hidden', 'true');
    };

    // Event listener to close edit modal
    closeModalBtn.addEventListener('click', closeEditModal);
    window.addEventListener('click', (e) => {
        if (e.target == editModal) {
            closeEditModal();
        }
    });

    // Handle edit form submission
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('editName').value.trim();
        const date = document.getElementById('editDate').value;
        const time = document.getElementById('editTime').value;
        const purpose = document.getElementById('editPurpose').value.trim();

        if (validateForm(name, date, time, purpose)) {
            let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
            const meetingIndex = meetings.findIndex(m => m.id === currentEditId);
            if (meetingIndex !== -1) {
                meetings[meetingIndex] = {
                    id: currentEditId,
                    name,
                    date,
                    time,
                    purpose
                };
                saveMeetings(meetings);
                updateMeetingInUI(meetings[meetingIndex]);
                closeEditModal();

                // Update event in calendar
                updateEventInCalendar(meetings[meetingIndex]);

                // Show success notification
                showNotification('Spotkanie zostało zaktualizowane pomyślnie!', 'success');
            }
        } else {
            showNotification('Wystąpił błąd podczas edytowania spotkania.', 'error');
        }
    });

    // Update meeting in UI list
    const updateMeetingInUI = (meeting) => {
        const li = meetingList.querySelector(`li[data-id='${meeting.id}']`);
        if (li) {
            const detailsDiv = li.querySelector('div');
            detailsDiv.innerHTML = `
                <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
                <p><span>Data:</span> ${formatDate(meeting.date)}</p>
                <p><span>Godzina:</span> ${meeting.time}</p>
                <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
            `;
            // Update event in calendar
            updateEventInCalendar(meeting);
        }
    };

    // Handle remove: open confirmation modal
    const handleRemove = (meeting) => {
        openConfirmDeleteModal(meeting);
    };

    // Confirmation modal
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    const openConfirmDeleteModal = (meeting) => {
        meetingToDelete = meeting;
        confirmDeleteModal.style.display = 'block';
        confirmDeleteModal.setAttribute('aria-hidden', 'false');
    };

    const closeConfirmDeleteModal = () => {
        confirmDeleteModal.style.display = 'none';
        meetingToDelete = null;
        confirmDeleteModal.setAttribute('aria-hidden', 'true');
    };

    // Confirm delete
    confirmDeleteBtn.addEventListener('click', () => {
        if (meetingToDelete) {
            const li = meetingList.querySelector(`li[data-id='${meetingToDelete.id}']`);
            if (li) {
                li.classList.add('fade-out');
                setTimeout(() => {
                    li.remove();
                    removeMeeting(meetingToDelete.id);
                    removeEventFromCalendar(meetingToDelete.id);
                    showNotification('Spotkanie zostało usunięte pomyślnie!', 'success');
                }, 300);
            }
            closeConfirmDeleteModal();
        }
    });

    // Cancel delete
    cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);

    // Close confirmation modal on clicking close buttons or outside
    const closeButtons = confirmDeleteModal.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeConfirmDeleteModal);
    });
    window.addEventListener('click', (e) => {
        if (e.target == confirmDeleteModal) {
            closeConfirmDeleteModal();
        }
    });

    // Remove meeting from localStorage
    const removeMeeting = (id) => {
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings(meetings);
    };

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const meetings = meetingList.querySelectorAll('li');

        meetings.forEach(meeting => {
            const name = meeting.querySelector('p:nth-child(1)').textContent.toLowerCase();
            const date = meeting.querySelector('p:nth-child(2)').textContent.toLowerCase();
            const time = meeting.querySelector('p:nth-child(3)').textContent.toLowerCase();
            const purpose = meeting.querySelector('p:nth-child(4)').textContent.toLowerCase();

            if (name.includes(query) || date.includes(query) || time.includes(query) || purpose.includes(query)) {
                meeting.style.display = 'flex';
            } else {
                meeting.style.display = 'none';
            }
        });
    });

    // Theme toggle
    const toggleTheme = () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    };

    themeToggleBtn.addEventListener('click', toggleTheme);

    // Load theme on startup
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    loadTheme();

    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pl',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        events: getCalendarEvents(),
        eventColor: '#4a90e2',
        eventTextColor: '#fff',
    });
    calendar.render();

    // Get events for FullCalendar from localStorage
    function getCalendarEvents() {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        return meetings.map(meeting => ({
            id: meeting.id.toString(),
            title: `${meeting.name} - ${meeting.purpose}`,
            start: `${meeting.date}T${meeting.time}`,
            allDay: false,
        }));
    }

    // Add event to calendar
    const addEventToCalendar = (meeting) => {
        calendar.addEvent({
            id: meeting.id.toString(),
            title: `${meeting.name} - ${meeting.purpose}`,
            start: `${meeting.date}T${meeting.time}`,
            allDay: false,
        });
    };

    // Update event in calendar
    const updateEventInCalendar = (meeting) => {
        const event = calendar.getEventById(meeting.id.toString());
        if (event) {
            event.setProp('title', `${meeting.name} - ${meeting.purpose}`);
            event.setStart(`${meeting.date}T${meeting.time}`);
        }
    };

    // Remove event from calendar
    const removeEventFromCalendar = (id) => {
        const event = calendar.getEventById(id.toString());
        if (event) {
            event.remove();
        }
    };

    // Function to render meeting list (used on load)
    const renderMeetingList = () => {
        meetingList.innerHTML = '';
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        const sortCriteria = sortSelect.value;
        meetings = sortMeetings(meetings, sortCriteria);
        meetings.forEach(meeting => addMeetingToList(meeting));
    };

    // Sorting meetings
    const sortMeetings = (meetings, criteria) => {
        switch (criteria) {
            case 'date-asc':
                return meetings.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            case 'date-desc':
                return meetings.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
            case 'name-asc':
                return meetings.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return meetings.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return meetings;
        }
    };

    // Handle push messages when app is in foreground
    messaging.onMessage((payload) => {
        console.log('Otrzymano wiadomość:', payload);
        showNotification(payload.notification.body, 'info');
    });

    // Function to subscribe user to push notifications (optional)
    const subscribeUserToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
            });
            console.log('Subscribed to push:', subscription);
            // TODO: Send subscription to server if needed
        } catch (error) {
            console.error('Błąd podczas subskrypcji push:', error);
        }
    };

    // Helper function to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Subscribe to push notifications on load (optional)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        subscribeUserToPush();
    }

    // Schedule in-app notification 15 minutes before meeting
    const scheduleNotification = (meeting) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
            const now = new Date();
            const timeDifference = meetingDateTime - now - (15 * 60 * 1000); // 15 minutes before

            if (timeDifference > 0) {
                setTimeout(() => {
                    showNotification(`Przypomnienie: Spotkanie z ${meeting.name} o ${meeting.time} (${meeting.purpose})`, 'info');
                }, timeDifference);
            }
        }
    };

    // Handle hamburger menu toggle
    const toggleMenu = () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Call loadMeetings on page load
    loadMeetings();
});