app.post('/api/update-username', async (req, res) => {
  try {
    const { username } = req.body;

    // Validate and update username in your database
    // Example:
    // await User.update({ username }, { where: { id: req.user.id } });

    res.status(200).json({ message: '用戶名更新成功' });
  } catch (error) {
    console.error('更新用戶名時出錯:', error);
    res.status(500).json({ message: '用戶名更新失敗' });
  }
});
