// User model
// This is a placeholder for a proper database model
// In a real application, this would be a Mongoose schema or similar

class User {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.username = data.username;
    this.password = data.password; // In a real app, this would be hashed
    this.role = data.role || 'patient';
    this.fullName = data.fullName || '';
    this.email = data.email || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Static methods for user management
  static findByUsername(username, users) {
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  static authenticate(username, password, users) {
    return users.find(
      user => user.username.toLowerCase() === username.toLowerCase() && 
              user.password === password
    );
  }

  // In a real app with a database, these would be methods to interact with the database
  static getAll(users) {
    return users.map(({ password, ...user }) => user); // Remove password from returned data
  }

  static create(userData, users) {
    const newUser = new User(userData);
    users.push(newUser);
    return newUser;
  }

  static update(id, userData, users) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    users[index] = updatedUser;
    return updatedUser;
  }

  static delete(id, users) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    return true;
  }
}

export default User;