document.addEventListener('DOMContentLoaded', () => {
    const meetingForm = document.getElementById('meetingForm');
    const meetingList = document.getElementById('meetingList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('editForm');
    let currentEditId = null;

    const loadMeetings = () => {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings.forEach(meeting => addMeetingToList(meeting));
    };

    const saveMeetings = (meetings) => {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    };

    const addMeetingToList = (meeting) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', meeting.id);
        li.innerHTML = `
            <div>
                <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
                <p><span>Data:</span> ${meeting.date}</p>
                <p><span>Godzina:</span> ${meeting.time}</p>
                <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
            </div>
            <div class="action-buttons">
                <button class="edit-btn" title="Edytuj Spotkanie"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Usuń Spotkanie"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        meetingList.prepend(li);

        li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(meeting));
        li.querySelector('.delete-btn').addEventListener('click', () => handleRemove(li, meeting.id));
    };

    meetingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const purpose = document.getElementById('purpose').value.trim();

        if (name && date && time && purpose) {
            const meeting = { id: Date.now(), name, date, time, purpose };
            addMeetingToList(meeting);

            let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
            meetings.push(meeting);
            saveMeetings(meetings);

            meetingForm.reset();
        }
    });

    const openEditModal = (meeting) => {
        currentEditId = meeting.id;
        document.getElementById('editName').value = meeting.name;
        document.getElementById('editDate').value = meeting.date;
        document.getElementById('editTime').value = meeting.time;
        document.getElementById('editPurpose').value = meeting.purpose;
        editModal.style.display = 'block';
    };

    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    const handleRemove = (li, id) => {
        li.remove();
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings(meetings);
    };

    loadMeetings();
});
