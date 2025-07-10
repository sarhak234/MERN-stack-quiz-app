const jwt = require('jsonwebtoken');

const adminauth = (req, res) => {
  try {
    const AdminData = [
      {
        name: 'sudhir pawar',
        email: 'sudhirpawar786786@gmail.com',
        password: '123sp234'
      },
      {
        name: 'sarthak mehta',
        email: 'sm123456@gmail.com',
        password: '123sm234'
      }
    ];

    // Normalize input
    let { name, email, password } = req.body;

    name = name?.toLowerCase().trim();
    email = email?.toLowerCase().trim();
    password = password?.trim(); // Optional: trim password in case of accidental space

    const admin = AdminData.find(
      (admin) =>
        admin.name === name &&
        admin.email === email &&
        admin.password === password
    );

    if (admin) {
      const token = jwt.sign(
        { email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({ message: "Admin logged in successfully", token });
    } else {
      console.log("Login failed for:", { name, email }); // For debugging
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in adminauth:", error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};

module.exports = adminauth;
