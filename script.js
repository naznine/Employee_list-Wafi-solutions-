let employees = [];

function fetchEmployees(page = 1) {
    fetch(`/api/employees?page=${page}`)
        .then(response => response.json())
        .then(data => {
            employees = data.employees;
            displayEmployees();
            setupPagination(data.totalPages);
        });
}

function displayEmployees() {
    const tbody = document.getElementById('employee-list');
    tbody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="/uploads/${employee.photo}" alt="Employee photo" width="50"></td>
            <td>${employee.fullName}</td>
            <td>${employee.email}</td>
            <td>${employee.mobile}</td>
            <td>${employee.dob}</td>
            <td>
                <button onclick="editEmployee(${employee.id})">Edit</button>
                <button onclick="deleteEmployee(${employee.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.onclick = () => fetchEmployees(i);
        pagination.appendChild(pageButton);
    }
}

function searchEmployees() {
    const query = document.getElementById('search').value;
    fetch(`/api/employees?search=${query}`)
        .then(response => response.json())
        .then(data => {
            employees = data.employees;
            displayEmployees();
        });
}

function sortTable(column) {
    employees.sort((a, b) => a[column] > b[column] ? 1 : -1);
    displayEmployees();
}

function editEmployee(id) {
    window.location.href = `/edit-employee.html?id=${id}`;
}

function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        fetch(`/api/employees/${id}`, { method: 'DELETE' })
            .then(() => fetchEmployees());
    }
}

document.addEventListener('DOMContentLoaded', () => fetchEmployees());
