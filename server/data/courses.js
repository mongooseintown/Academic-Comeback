// Course Data for CSE Department (Semester 1-5)
const courses = {
    1: [
        {
            code: 'CSE-1121',
            title: 'Computer Programming I',
            credits: 3,
            mid: { syllabus: 'Intro to C, Variables, Loops', resources: [] },
            final: { syllabus: 'Arrays, Pointers, Functions', resources: [] }
        },
        {
            code: 'CSE-1122',
            title: 'Computer Programming I Lab',
            credits: 1.5,
            mid: { syllabus: 'Lab tasks 1-5', resources: [] },
            final: { syllabus: 'Lab tasks 6-10', resources: [] }
        },
        {
            code: 'EEE-1121',
            title: 'Basic Electrical Engineering',
            credits: 3,
            mid: { syllabus: 'DC Circuits, Kirchhoff Laws', resources: [] },
            final: { syllabus: 'AC Circuits, Transformers', resources: [] }
        },
        {
            code: 'EEE-1122',
            title: 'Basic Electrical Engineering Lab',
            credits: 1.5,
            mid: { syllabus: 'Experiments 1-4', resources: [] },
            final: { syllabus: 'Experiments 5-8', resources: [] }
        },
        {
            code: 'MATH-1107',
            title: 'Mathematics I (Diff. & Int. Calculus)',
            credits: 3,
            mid: { syllabus: 'Limits, Continuity, Derivatives', resources: [] },
            final: { syllabus: 'Integration, Series', resources: [] }
        },
        {
            code: 'PHY-1101',
            title: 'Physics I',
            credits: 3,
            mid: { syllabus: 'Mechanics, Newton\'s Laws', resources: [] },
            final: { syllabus: 'Thermodynamics, Waves', resources: [] }
        },
        {
            code: 'GEEL-1106',
            title: 'Advanced English',
            credits: 2,
            mid: { syllabus: 'Grammar, Writing 1', resources: [] },
            final: { syllabus: 'Speaking, Writing 2', resources: [] }
        },
        {
            code: 'GEEM-1101',
            title: 'Text of Ethics and Morality',
            credits: 1,
            mid: { syllabus: 'Ethics basics', resources: [] },
            final: { syllabus: 'Moral applications', resources: [] }
        }
    ],
    2: [
        {
            code: 'CSE-1221',
            title: 'Computer Programming 2',
            credits: 3,
            mid: { syllabus: 'OOP Concepts, Classes', resources: [] },
            final: { syllabus: 'Inheritance, Polymorphism', resources: [] }
        },
        {
            code: 'CSE-1222',
            title: 'Computer Programming 2 Lab',
            credits: 1.5,
            mid: { syllabus: 'OOP Lab Tasks 1-5', resources: [] },
            final: { syllabus: 'OOP Lab Tasks 6-10', resources: [] }
        },
        {
            code: 'CSE-1223',
            title: 'Discrete Mathematics',
            credits: 3,
            mid: { syllabus: 'Sets, Logic, Proofs', resources: [] },
            final: { syllabus: 'Graphs, Trees', resources: [] }
        },
        {
            code: 'EEE-1221',
            title: 'Electronics',
            credits: 3,
            mid: { syllabus: 'Diodes, BJTs', resources: [] },
            final: { syllabus: 'FETs, Op-Amps', resources: [] }
        },
        {
            code: 'EEE-1222',
            title: 'Electronics Lab',
            credits: 1.5,
            mid: { syllabus: 'Analog Circuits 1', resources: [] },
            final: { syllabus: 'Analog Circuits 2', resources: [] }
        },
        {
            code: 'MATH-1207',
            title: 'Mathematics II',
            credits: 3,
            mid: { syllabus: 'Coordinate Geometry', resources: [] },
            final: { syllabus: 'Differential Equations', resources: [] }
        },
        {
            code: 'PHY-1201',
            title: 'Physics II',
            credits: 3,
            mid: { syllabus: 'Electromagnetism', resources: [] },
            final: { syllabus: 'Optics, Modern Physics', resources: [] }
        },
        {
            code: 'PHY-1204',
            title: 'Physics II Lab',
            credits: 1.5,
            mid: { syllabus: 'EM Experiments', resources: [] },
            final: { syllabus: 'Optics Experiments', resources: [] }
        },
        {
            code: 'CSE-1230',
            title: 'Competitive Programming 1',
            credits: 1,
            mid: { syllabus: 'Basic Problems', resources: [] },
            final: { syllabus: 'Intermediate Problems', resources: [] }
        },
        {
            code: 'GEED-1201',
            title: "Basic Principles of Islam",
            credits: 2,
            mid: { syllabus: 'Aqidah', resources: [] },
            final: { syllabus: 'Ibadah', resources: [] }
        }
    ],
    3: [
        {
            code: 'CSE-2321',
            title: 'Data Structures',
            credits: 3,
            mid: { syllabus: 'Arrays, Linked Lists, Stacks', resources: [] },
            final: { syllabus: 'Trees, Graphs, Hashing', resources: [] }
        },
        {
            code: 'CSE-2322',
            title: 'Data Structures Lab',
            credits: 1,
            mid: { syllabus: 'Implementation 1', resources: [] },
            final: { syllabus: 'Implementation 2', resources: [] }
        },
        {
            code: 'CSE-2323',
            title: 'Digital Logic Design',
            credits: 3,
            mid: { syllabus: 'Number Systems, Gates', resources: [] },
            final: { syllabus: 'Sequential Circuits, Counters', resources: [] }
        },
        {
            code: 'CSE-2324',
            title: 'Digital Logic Design Lab',
            credits: 1.5,
            mid: { syllabus: 'Combinational Circuits', resources: [] },
            final: { syllabus: 'Sequential Circuits', resources: [] }
        },
        {
            code: 'MATH-2307',
            title: 'Mathematics III',
            credits: 3,
            mid: { syllabus: 'Matrices, Determinants', resources: [] },
            final: { syllabus: 'Vector Analysis', resources: [] }
        },
        {
            code: 'STAT-2311',
            title: 'Probability and Statistics',
            credits: 2,
            mid: { syllabus: 'Probability Theory', resources: [] },
            final: { syllabus: 'Distributions, Statistics', resources: [] }
        },
        {
            code: 'CHEM-2301',
            title: 'Chemistry',
            credits: 3,
            mid: { syllabus: 'Atomic Structure', resources: [] },
            final: { syllabus: 'Chemical Reactions', resources: [] }
        },
        {
            code: 'CSE-2340',
            title: 'Software Development 1',
            credits: 2,
            mid: { syllabus: 'Requirements, Design', resources: [] },
            final: { syllabus: 'Testing, Deployment', resources: [] }
        },
        {
            code: 'URED-2302',
            title: 'Sciences of Quran and Hadith',
            credits: 1,
            mid: { syllabus: 'Quranic Sciences', resources: [] },
            final: { syllabus: 'Hadith Sciences', resources: [] }
        }
    ],
    4: [
        {
            code: 'CSE-2421',
            title: 'Computer Algorithms',
            credits: 3,
            mid: { syllabus: 'Divide & Conquer, Greedy', resources: [] },
            final: {
                syllabus: 'DP, Graph Algo, NP',
                resources: [],
                roadmap: [
                    {
                        title: "Segment-04 | Greedy Algorithms and String Matching Algorithms",
                        topics: [
                            {
                                name: "Greedy Algorithms",
                                subtopics: ["Activity Selection Problem", "Elements of Greedy Strategy", "Huffman Codes and Its Application"]
                            },
                            {
                                name: "String Matching Algorithms",
                                subtopics: ["Naive String-Matching Algorithm", "Rabin-Karp Algorithm", "Complexity Analysis of the Algorithms"]
                            }
                        ]
                    },
                    {
                        title: "Segment-05 | Graphs Basic & Traversal Techniques",
                        topics: [
                            {
                                name: "Representation of Graphs",
                                subtopics: []
                            },
                            {
                                name: "Breadth First Search",
                                subtopics: ["Algorithm of BFS", "Application of BFS"]
                            },
                            {
                                name: "Depth First Search",
                                subtopics: ["Algorithm of DFS", "Application of DFS"]
                            },
                            {
                                name: "Minimum Spanning Tree",
                                subtopics: ["Kruskal's Algorithm", "Prim's Algorithm"]
                            },
                            {
                                name: "Complexity Analysis of the Algorithms",
                                subtopics: []
                            }
                        ]
                    },
                    {
                        title: "Segment-06 | Shortest Path Algorithms",
                        topics: [
                            {
                                name: "Single-source Shortest Path",
                                subtopics: ["Dijkstra's Algorithm", "Bellman-Ford's Algorithm"]
                            },
                            {
                                name: "All-pairs Shortest Path",
                                subtopics: ["Floyd-Warshall's Algorithm"]
                            },
                            {
                                name: "Complexity Analysis of the Algorithms",
                                subtopics: []
                            }
                        ]
                    },
                    {
                        title: "Segment-07 | Computational Geometry & Number Theory",
                        topics: [
                            {
                                name: "Computational Geometry",
                                subtopics: ["Line Segment Properties", "Convex Hull", "Graham Scan Algorithm of Convex Hull"]
                            },
                            {
                                name: "Number Theory",
                                subtopics: ["GCD", "Modular Arithmetic", "Prime Number Generation"]
                            },
                            {
                                name: "Complexity Analysis of the Algorithms",
                                subtopics: []
                            }
                        ]
                    },
                    {
                        title: "Segment-08 | Theory of NP-Completeness & Coping with Hardness",
                        topics: [
                            {
                                name: "Theory of NP-Completeness",
                                subtopics: ["P", "NP", "NP-Complete Problems", "NP-Hard Problems"]
                            },
                            {
                                name: "Backtracking",
                                subtopics: ["N-Queen Problem"]
                            },
                            {
                                name: "Branch and Bound",
                                subtopics: []
                            },
                            {
                                name: "Approximation Algorithms",
                                subtopics: []
                            }
                        ]
                    }
                ]
            }
        },
        {
            code: 'CSE-2422',
            title: 'Computer Algorithms Lab',
            credits: 1,
            mid: { syllabus: 'Sorting, Greedy Impl', resources: [] },
            final: { syllabus: 'DP, Graph Impl', resources: [] }
        },
        {
            code: 'CSE-2423',
            title: 'Database Management Systems',
            credits: 3,
            mid: { syllabus: 'ER Models, Relational Model', resources: [] },
            final: { syllabus: 'SQL, Normalization, Trans.', resources: [] }
        },
        {
            code: 'CSE-2424',
            title: 'DBMS Lab',
            credits: 1.5,
            mid: { syllabus: 'Schema Design', resources: [] },
            final: { syllabus: 'Advanced SQL, PL/SQL', resources: [] }
        },
        {
            code: 'CSE-2427',
            title: 'Theory of Computation',
            credits: 3,
            mid: { syllabus: 'Automata, Regular Lang', resources: [] },
            final: { syllabus: 'Context-Free, Turing Machines', resources: [] }
        },
        {
            code: 'MATH-2407',
            title: 'Mathematics IV',
            credits: 3,
            mid: { syllabus: 'Complex Var 1', resources: [] },
            final: { syllabus: 'Complex Var 2, Fourier', resources: [] }
        },
        {
            code: 'ME-2412',
            title: 'Engineering Drawing Lab',
            credits: 1,
            mid: { syllabus: 'Projections', resources: [] },
            final: { syllabus: 'CAD Basics', resources: [] }
        },
        {
            code: 'CSE-2430',
            title: 'Competitive Programming 2',
            credits: 1,
            mid: { syllabus: 'Adv Data Structures', resources: [] },
            final: { syllabus: 'Adv Algorithms', resources: [] }
        },
        {
            code: 'ACC-2401',
            title: 'Financial Accounting',
            credits: 2,
            mid: {
                syllabus: 'Accounting Basics',
                resources: [
                    {
                        name: 'Previous Year Question - Mid Term',
                        link: 'https://mega.nz/file/moRFHJSK#dNNUkqbY7ranqtmUiynokGMmCTDW0sn2fpmEKFfc0Sg',
                        type: 'prev_question'
                    }
                ]
            },
            final: { syllabus: 'Financial Statements', resources: [] }
        },
        {
            code: 'GEBL-2401',
            title: 'Functional Bengali Language',
            credits: 2,
            mid: { syllabus: 'Grammar', resources: [] },
            final: { syllabus: 'Literature', resources: [] }
        }
    ],
    5: [
        {
            code: 'CSE-3521',
            title: 'Computer Architecture',
            credits: 3,
            mid: { syllabus: 'Instruction Sets', resources: [] },
            final: { syllabus: 'Pipelining, Memory', resources: [] }
        },
        {
            code: 'CSE-3523',
            title: 'Microprocessors',
            credits: 3,
            mid: {
                syllabus: '8086 Architecture',
                resources: [
                    {
                        name: 'Lecture Slide - 1st Segment',
                        link: 'https://mega.nz/file/nwA0jRiQ#jOjQM2lxn1rYXmtqgHFxqlA47xp4zHrW0wlnlyapMog',
                        type: 'slides',
                        segment: 1
                    }
                ]
            },
            final: { syllabus: 'Interfacing, Microcontrollers', resources: [] }
        },
        {
            code: 'CSE-3524',
            title: 'Microprocessors Lab',
            credits: 1,
            mid: { syllabus: 'Assembly 1', resources: [] },
            final: { syllabus: 'Assembly 2 & Interfacing', resources: [] }
        },
        {
            code: 'CSE-3527',
            title: 'Compiler',
            credits: 3,
            mid: { syllabus: 'Lexical, Syntax Analysis', resources: [] },
            final: { syllabus: 'Semantic, Code Gen', resources: [] }
        },
        {
            code: 'CSE-3528',
            title: 'Compiler Lab',
            credits: 1,
            mid: { syllabus: 'Symbol Table, Parser', resources: [] },
            final: { syllabus: 'Code Gen Impl', resources: [] }
        },
        {
            code: 'CSE-3529',
            title: 'Systems Analysis and Design',
            credits: 3,
            mid: { syllabus: 'SDLC, Feasibility', resources: [] },
            final: { syllabus: 'Design, Implementation', resources: [] }
        },
        {
            code: 'CSE-3532',
            title: 'Internet Programming',
            credits: 2,
            mid: { syllabus: 'HTML/CSS/JS Basics', resources: [] },
            final: { syllabus: 'Backend, Frameworks', resources: [] }
        },
        {
            code: 'EEE-2421',
            title: 'Electrical Drive & Inst.',
            credits: 2,
            mid: { syllabus: 'Motors', resources: [] },
            final: { syllabus: 'Instruments', resources: [] }
        },
        {
            code: 'EEE-2422',
            title: 'Electrical Drive Lab',
            credits: 1,
            mid: { syllabus: 'Motor Experiments', resources: [] },
            final: { syllabus: 'Instrumentation exp', resources: [] }
        },
        {
            code: 'URED-3503',
            title: 'Pol. Thoughts & Social Behavior',
            credits: 1,
            mid: { syllabus: 'Political Theory', resources: [] },
            final: { syllabus: 'Social Behavior', resources: [] }
        }
    ],
    6: [
        {
            code: 'CSE-3525',
            title: 'Data Communication',
            credits: 3,
            mid: { syllabus: 'Data Transmission, Encoding, Multiplexing', resources: [] },
            final: { syllabus: 'Switching, Routing, Error Control', resources: [] }
        },
        {
            code: 'CSE-3631',
            title: 'Operating Systems',
            credits: 3,
            mid: { syllabus: 'Processes, Threads, Scheduling', resources: [] },
            final: { syllabus: 'Memory Management, File Systems', resources: [] }
        },
        {
            code: 'CSE-3632',
            title: 'Operating Systems Lab',
            credits: 1,
            mid: { syllabus: 'Shell Scripting, Process Mgmt', resources: [] },
            final: { syllabus: 'Concurrency, File Systems Impl', resources: [] }
        },
        {
            code: 'CSE-3635',
            title: 'Artificial Intelligence',
            credits: 3,
            mid: { syllabus: 'Agents, Search Algorithms', resources: [] },
            final: { syllabus: 'Logic, Planning, Learning', resources: [] }
        },
        {
            code: 'CSE-3636',
            title: 'Artificial Intelligence Lab',
            credits: 1,
            mid: { syllabus: 'Search Algorithms Impl', resources: [] },
            final: { syllabus: 'ML/Logic Projects', resources: [] }
        },
        {
            code: 'CSE-3641',
            title: 'Software Engineering',
            credits: 3,
            mid: { syllabus: 'Process Models, Requirements', resources: [] },
            final: { syllabus: 'Design, Testing, Maintenance', resources: [] }
        },
        {
            code: 'CSE-3642',
            title: 'Software Engineering Lab',
            credits: 1,
            mid: { syllabus: 'UML, Requirements Analysis', resources: [] },
            final: { syllabus: 'Design Patterns, Testing Tools', resources: [] }
        },
        {
            code: 'CSE-3644',
            title: 'Software Development 2 Lab',
            credits: 1,
            mid: { syllabus: 'Advanced Frameworks Setup', resources: [] },
            final: { syllabus: 'Full Stack Project Development', resources: [] }
        },
        {
            code: 'ECON-3501',
            title: 'Principles of Economics',
            credits: 2,
            mid: { syllabus: 'Microeconomics Basics', resources: [] },
            final: { syllabus: 'Macroeconomics Overview', resources: [] }
        },
        {
            code: 'URED-3604',
            title: 'Life and Teachings of Prophet Muhammad(SAAS)',
            credits: 1,
            mid: { syllabus: 'Meccan Period', resources: [] },
            final: { syllabus: 'Medinan Period', resources: [] }
        },
        {
            code: 'GEHE-3601',
            title: 'History of the Emergence of Bangladesh',
            credits: 2,
            mid: { syllabus: 'British Rule, Partition', resources: [] },
            final: { syllabus: 'Language Movement, Liberation War', resources: [] }
        }
    ],
    7: [
        {
            code: 'CSE-3633',
            title: 'Computer Networks',
            credits: 3,
            mid: { syllabus: 'Network Layer, Transport Layer', resources: [] },
            final: { syllabus: 'Application Layer, Security', resources: [] }
        },
        {
            code: 'CSE-3634',
            title: 'Computer Networks Lab',
            credits: 1.5,
            mid: { syllabus: 'Packet Tracing, Socket Programming', resources: [] },
            final: { syllabus: 'Routing Protocols, Network Config', resources: [] }
        },
        {
            code: 'CSE-4741',
            title: 'Computer Graphics',
            credits: 3,
            mid: { syllabus: '2D Graphics, Transformations', resources: [] },
            final: { syllabus: '3D Graphics, Rendering, Animation', resources: [] }
        },
        {
            code: 'CSE-4742',
            title: 'Computer Graphics Lab',
            credits: 1,
            mid: { syllabus: 'OpenGL Basics, 2D Drawing', resources: [] },
            final: { syllabus: '3D Rendering, Lighting, Shading', resources: [] }
        },
        {
            code: 'CSE-4877',
            title: 'Machine Learning Data Mining',
            credits: 3,
            mid: { syllabus: 'Supervised Learning, Regression', resources: [] },
            final: { syllabus: 'Unsupervised Learning, Clustering', resources: [] }
        },
        {
            code: 'CSE-4878',
            title: 'Machine Learning And Data Mining Lab',
            credits: 1,
            mid: { syllabus: 'Data Preprocessing, Regression Models', resources: [] },
            final: { syllabus: 'Classification, Clustering, Projects', resources: [] }
        },
        {
            code: 'CSE-4745',
            title: 'Numerical Methods',
            credits: 2,
            mid: { syllabus: 'Roots of Equations, Linear Algebra', resources: [] },
            final: { syllabus: 'Integration, Differential Equations', resources: [] }
        },
        {
            code: 'CSE-4746',
            title: 'Numerical Methods Lab',
            credits: 1,
            mid: { syllabus: 'Implementation of Root Finding', resources: [] },
            final: { syllabus: 'Numerical Integration Impl', resources: [] }
        },
        {
            code: 'CSE-4747',
            title: 'Mathematical Analysis for Computer Science',
            credits: 3,
            mid: { syllabus: 'Complex Analysis, Transforms', resources: [] },
            final: { syllabus: 'Stochastic Processes, Optimization', resources: [] }
        },
        {
            code: 'CSE-4750',
            title: 'Technical Writing and Presentation',
            credits: 1,
            mid: { syllabus: 'Writing Skills, Report Structure', resources: [] },
            final: { syllabus: 'Presentation Skills, Public Speaking', resources: [] }
        },
        {
            code: 'CSE-4708',
            title: 'Field Work',
            credits: 1,
            mid: { syllabus: 'Industry Visit / Field Study Plan', resources: [] },
            final: { syllabus: 'Report Submission & Presentation', resources: [] }
        },
        {
            code: 'URIH-4701',
            title: 'A Survey of Islamic History and Culture',
            credits: 1,
            mid: { syllabus: 'Early Islamic History', resources: [] },
            final: { syllabus: 'Islamic Civilization & Culture', resources: [] }
        }
    ],
    8: [
        {
            code: 'CHEM-2304',
            title: 'Chemistry Lab',
            credits: 1.5,
            mid: { syllabus: 'Inorganic Analysis', resources: [] },
            final: { syllabus: 'Organic Synthesis, Titrations', resources: [] }
        },
        {
            code: 'CSE-4805',
            title: 'Social, Professional, and Ethical Issues',
            credits: 2,
            mid: { syllabus: 'Professional Ethics, Privacy', resources: [] },
            final: { syllabus: 'Cyber Law, Social Impact', resources: [] }
        },
        {
            code: 'CSE-4743',
            title: 'Computer Security',
            credits: 2,
            mid: { syllabus: 'Cryptography Basics', resources: [] },
            final: { syllabus: 'Network Security, Web Security', resources: [] }
        },
        {
            code: 'CSE-4744',
            title: 'Computer Security Lab',
            credits: 1,
            mid: { syllabus: 'Encryption/Decryption Tools', resources: [] },
            final: { syllabus: 'Penetration Testing, Firewall Config', resources: [] }
        },
        {
            code: 'CSE-4875',
            title: 'Pattern Recognition and Image Processing',
            credits: 3,
            mid: { syllabus: 'Image Enhancement, Filtering', resources: [] },
            final: { syllabus: 'Segmentation, Pattern Recognition', resources: [] }
        },
        {
            code: 'CSE-4876',
            title: 'Pattern Recognition and Image Processing Lab',
            credits: 1,
            mid: { syllabus: 'Image Operation with OpenCV/Matlab', resources: [] },
            final: { syllabus: 'Recognition Systems Implementation', resources: [] }
        },
        {
            code: 'CSE-4871',
            title: 'Neural Network and Fuzzy System',
            credits: 3,
            mid: { syllabus: 'ANN Basics, Perceptrons', resources: [] },
            final: { syllabus: 'Backpropagation, Fuzzy Logic', resources: [] }
        },
        {
            code: 'CSE-4872',
            title: 'Neural Network and Fuzzy System Lab',
            credits: 1,
            mid: { syllabus: 'NN Implementation', resources: [] },
            final: { syllabus: 'Fuzzy System Design', resources: [] }
        },
        {
            code: 'MGT-3601',
            title: 'Industrial Management',
            credits: 2,
            mid: { syllabus: 'Management Principles, Org Structure', resources: [] },
            final: { syllabus: 'Production, HR Management', resources: [] }
        },
        {
            code: 'CSE-4800',
            title: 'Project/Thesis',
            credits: 4,
            mid: { syllabus: 'Proposal Defense & Initial Work', resources: [] },
            final: { syllabus: 'Final Implementation & Defense', resources: [] }
        },
        {
            code: 'CSE-4822',
            title: 'General Viva',
            credits: 1,
            mid: { syllabus: 'Preparation for Comprehensive Viva', resources: [] },
            final: { syllabus: 'Mock Viva & Final Assessment', resources: [] }
        }
    ]
};

module.exports = courses;
