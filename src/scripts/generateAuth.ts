import * as readline from 'readline';
import * as crypto from 'crypto';
import chalk from 'chalk';
import boxen from 'boxen';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import { generateUID, generatePID } from '../lib/idGenerator';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// MongoDB connection setup
const uri = process.env.MONGODB_URI || '';

// Validate MongoDB URI before creating client
if (!uri) {
    console.error(chalk.red('❌ MONGODB_URI is not defined in environment variables.'));
    console.error(chalk.yellow('Please create a .env or .env.local file with MONGODB_URI'));
    process.exit(1);
}

if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error(chalk.red('❌ Invalid MongoDB URI format.'));
    console.error(chalk.yellow('URI should start with "mongodb://" or "mongodb+srv://"'));
    console.error(chalk.gray(`Current URI: ${uri.substring(0, 20)}...`));
    process.exit(1);
}

const client = new MongoClient(uri);

const generatePassword = (length: number = 12): string => {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const displayCredentials = (email: string, password: string, uid: string = '', pid: string = '') => {
    let boxContent = `
${chalk.green.bold('Generated Credentials')}

${chalk.blue('Email:')} ${email}
${chalk.blue('Password:')} ${password}`;

    if (uid) {
        boxContent += `
${chalk.cyan('User ID:')} ${uid}`;
    }

    if (pid) {
        boxContent += `
${chalk.magenta('Payment ID:')} ${pid}`;
    }

    boxContent += '\n';

    console.log(
        boxen(boxContent, {
            padding: 1,
            margin: 1,
            borderColor: 'green',
            borderStyle: 'round'
        })
    );
};

const storeCredentials = async (email: string, password: string, name: string) => {
    try {
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(chalk.red('User already exists with this email.'));
            return { success: false };
        }

        // Generate UID and PID for admin
        const uid = await generateUID(true);
        const pid = await generatePID();

        // Hash the password before storing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            uid,
            pid,
            paymentHistory: []
        });

        await newUser.save();
        console.log(chalk.green('✓ Credentials stored successfully in the database.'));
        return { success: true, uid, pid };
    } catch (error) {
        console.error(chalk.red('Error storing credentials:'), error);
        return { success: false };
    }
};

// New UI Functions
const clearScreen = () => {
    console.clear();
};

const displayBanner = () => {
    const banner = `
           ${chalk.cyan.bold('SPYBERPOLYMATH CREDENTIAL MANAGER')}
                          ${chalk.yellow('v1.0.0')}
`;
    console.log(chalk.green(banner));
};

const displayMenu = () => {
    const menu = `
${chalk.yellow.bold('Please select an option:')}

${chalk.cyan('1.')} Register New User (Manual Password)
${chalk.cyan('2.')} Register New User (Auto-generate Password)
${chalk.cyan('3.')} Exit

`;
    console.log(menu);
};

const promptMenu = (): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(chalk.magenta('Enter your choice (1-3): '), (answer) => {
            resolve(answer.trim());
        });
    });
};

const promptEmail = (): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('Enter email: '), (email) => {
            resolve(email.trim());
        });
    });
};

const promptPassword = (): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('Enter password: '), (password) => {
            resolve(password.trim());
        });
    });
};

const promptPasswordLength = (): Promise<number> => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('Enter password length (default 12): '), (length) => {
            const parsedLength = parseInt(length.trim());
            resolve(isNaN(parsedLength) || parsedLength < 8 ? 12 : parsedLength);
        });
    });
};

const promptName = (): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('Enter your name: '), (name) => {
            resolve(name.trim());
        });
    });
};

const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleManualRegistration = async () => {
    const email = await promptEmail();

    if (!validateEmail(email)) {
        console.error(chalk.red('\n✗ Invalid email format.\n'));
        return;
    }

    const password = await promptPassword();

    if (password.length < 6) {
        console.error(chalk.red('\n✗ Password must be at least 6 characters long.\n'));
        return;
    }

    const name = await promptName();

    console.log(chalk.cyan('\n⏳ Storing credentials...\n'));
    const result = await storeCredentials(email, password, name);
    if (result.success) {
        displayCredentials(email, password, result.uid, result.pid);
    }
};

const handleAutoRegistration = async () => {
    const email = await promptEmail();

    if (!validateEmail(email)) {
        console.error(chalk.red('\n✗ Invalid email format.\n'));
        return;
    }

    const length = await promptPasswordLength();
    const password = generatePassword(length);

    const name = await promptName();

    console.log(chalk.cyan('\n⏳ Generating password and storing credentials...\n'));
    const result = await storeCredentials(email, password, name);
    if (result.success) {
        displayCredentials(email, password, result.uid, result.pid);
    }
};

const showLoadingAnimation = (message: string): NodeJS.Timeout => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    return setInterval(() => {
        process.stdout.write(`\r${chalk.cyan(frames[i])} ${message}`);
        i = (i + 1) % frames.length;
    }, 80);
};

const mainLoop = async () => {
    let running = true;

    while (running) {
        clearScreen();
        displayBanner();
        displayMenu();

        const choice = await promptMenu();

        switch (choice) {
            case '1':
                console.log(chalk.green.bold('\n📝 Manual Registration\n'));
                await handleManualRegistration();
                break;

            case '2':
                console.log(chalk.green.bold('\n🔐 Auto-generate Password Registration\n'));
                await handleAutoRegistration();
                break;

            case '3':
                console.log(chalk.yellow('\n👋 Goodbye! Exiting...\n'));
                running = false;
                break;

            default:
                console.log(chalk.red('\n✗ Invalid choice. Please select 1, 2, or 3.\n'));
                break;
        }

        if (running && choice !== '3') {
            await new Promise((resolve) => {
                rl.question(chalk.gray('\nPress Enter to continue...'), () => {
                    resolve(null);
                });
            });
        }
    }

    rl.close();
    process.exit(0);
};

// Start the application
console.log(chalk.cyan('🚀 Initializing Credential Manager...\n'));
mainLoop().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    rl.close();
    process.exit(1);
});