const config = {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiration: '30d',
};

export default config;
