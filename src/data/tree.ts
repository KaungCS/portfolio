export type TreeNode = {
  id: string;
  label: string;       // SHORT CODE (e.g. "CSE 142")
  fullTitle?: string;  // LONG TITLE (e.g. "Intro to Programming I")
  description?: string;
  parent?: string;
  status: 'completed' | 'in-progress' | 'planned';
};

export const treeData: TreeNode[] = [
  {
    id: "cse121",
    label: "CSE 121",
    fullTitle: "Introduction to Computer Programming I",
    description: "Introduction to computer programming for students without previous experience. Focuses on writing programs to express algorithmic thinking and solve computational problems using procedural programming constructs like loops, conditionals, methods, and arrays.",
    status: "completed",
  },
  {
    id: "cse122",
    label: "CSE 122",
    fullTitle: "Introduction to Computer Programming II",
    description: "Emphasizes program design, style, and decomposition. Uses data structures (e.g., lists, dictionaries, sets) to solve computational problems. Introduces data abstraction and interface versus implementation.",
    status: "completed",
    parent: "cse121",
  },
  {
    id: "cse123",
    label: "CSE 123",
    fullTitle: "Introduction to Computer Programming III",
    description: "Focused on the design and implementation of data structures. Covers implementation of compound data structures (lists, trees), recursion, inheritance, and relationships among similar classes.",
    status: "completed",
    parent: "cse122",
  },
  {
    id: "cse311",
    label: "CSE 311",
    fullTitle: "Foundations of Computing I",
    description: "Examines fundamentals of logic, set theory, induction, and algebraic structures with applications to computing, finite state machines, and limits of computability.",
    status: "completed",
    parent: "cse123",
  },
  {
    id: "cse312",
    label: "CSE 312",
    fullTitle: "Foundations of Computing II",
    description: "Examines fundamentals of enumeration and discrete probability, applications of randomness to computing, polynomial-time versus NP, and NP-completeness.",
    status: "completed",
    parent: "cse311",
  },
  {
    id: "cse332",
    label: "CSE 332",
    fullTitle: "Data Structures and Parallelism",
    description: "Covers abstract data types (dictionaries, balanced trees, hash tables, priority queues, graphs), sorting, asymptotic analysis, multithreading, and parallel algorithms.",
    status: "completed",
    parent: "cse311",
  },
  {
    id: "cse331",
    label: "CSE 331",
    fullTitle: "Software Design and Implementation",
    description: "Explores concepts and techniques for design and construction of reliable and maintainable software systems: specifications, program structure, correctness testing, and event-driven programming.",
    status: "completed",
    parent: "cse123",
  },
  {
    id: "cse351",
    label: "CSE 351",
    fullTitle: "The Hardware/Software Interface",
    description: "Examines key computational abstraction levels below modern high-level languages: number representation, assembly language, memory management, the operating-system process model, and high-level machine architecture.",
    status: "in-progress",
    parent: "cse391",
  },
  {
    id: "cse440",
    label: "CSE 440",
    fullTitle: "Introduction to HCI",
    description: "Introduction to human-computer interaction and the design process. Covers the full cycle from the initial formulation of a design problem to ideation, user research, sketching, and creation of digital prototypes.",
    status: "completed",
    parent: "cse332",
  },
  {
    id: "cse473",
    label: "CSE 473",
    fullTitle: "Artificial Intelligence",
    description: "Principal ideas and developments in artificial intelligence: Problem solving and search, game playing, knowledge representation and reasoning, uncertainty, machine learning, and natural language processing.",
    status: "in-progress",
    parent: "cse332",
  },
  {
    id: "cse391",
    label: "CSE 391",
    fullTitle: "System and Software Tools",
    description: "Introduction to tools commonly used in software development. Topics include using a command-line interface, writing scripts for file and string manipulation, managing user permissions, manipulating text with regular expressions, using build-management tools, and using version-control systems.",
    status: "in-progress",
    parent: "cse123", // Usually taken after intro series
  },
  {
    id: "cse492j",
    label: "CSE 492 J",
    fullTitle: "Computer Science Career Seminar",
    description: "Weekly seminars featuring speakers from diverse careers in the tech industry. Focuses on career planning, job searching, professional development, and exploring different roles within the field of computing.",
    status: "in-progress", // or 'in-progress'
    parent: "cse332", // Seminar usually taken by juniors/seniors
  },
  {
    id: "cse394",
    label: "CSE 394",
    fullTitle: "Intro to Research in CSE",
    description: "Introduces skills and concepts enabling participation in computer science research. Covers the research process, different fields and methods of computing research, and practical techniques.",
    status: "completed",
    // Root node for the research track
  },
  {
    id: "cse494",
    label: "CSE 494",
    fullTitle: "Guided Research in CSE",
    description: "Provides guided initial research experiences in computer science. Research projects are completed either individually or in small student teams under the guidance of mentors.",
    status: "in-progress",
    parent: "cse394",
  },
];

export default treeData;