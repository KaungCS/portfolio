export type TreeNode = {
  id: string;
  label: string;       // SHORT CODE (e.g. "CSE 142")
  fullTitle?: string;  // LONG TITLE (e.g. "Intro to Programming I")
  description?: string;
  parent?: string;     // ✅ FIXED: Singular string
  status: 'completed' | 'in-progress' | 'planned';
};

export const treeData: TreeNode[] = [
  {
    id: "cse121",
    label: "CSE 121",
    fullTitle: "Introduction to Computer Programming I",
    description: "Development of computer programs and basic programming concepts.",
    status: "completed",
    // No parent (Root)
  },
  {
    id: "cse122",
    label: "CSE 122",
    fullTitle: "Introduction to Computer Programming II",
    description: "Data abstraction, algorithms, and data structures.",
    status: "completed",
    parent: "cse121", // ✅ Changed from parents: ["cse121"]
  },
  {
    id: "cse123",
    label: "CSE 123",
    fullTitle: "Introduction to Computer Programming III",
    description: "Advanced programming concepts, visualization, and application.",
    status: "completed",
    parent: "cse122",
  },
  {
    id: "cse311",
    label: "CSE 311",
    fullTitle: "Foundations of Computing I",
    description: "Examining the fundamentals of logic, set theory, and induction.",
    status: "completed",
    parent: "cse123",
  },
  {
    id: "cse312",
    label: "CSE 312",
    fullTitle: "Foundations of Computing II",
    description: "Probability and statistics for computer science.",
    status: "completed",
    parent: "cse311",
  },
  {
    id: "cse332",
    label: "CSE 332",
    fullTitle: "Data Structures and Parallelism",
    description: "Advanced data structures, parallelism, and concurrency.",
    status: "completed",
    parent: "cse311",
  },
  {
    id: "cse331",
    label: "CSE 331",
    fullTitle: "Software Design and Implementation",
    description: "Design, implementation, and testing of large-scale software.",
    status: "completed",
    parent: "cse123",
  },
  {
    id: "cse351",
    label: "CSE 351",
    fullTitle: "The Hardware/Software Interface",
    description: "Understanding how software interacts with hardware.",
    status: "in-progress",
    parent: "cse123",
  },
  {
    id: "cse440",
    label: "CSE 440",
    fullTitle: "Introduction to HCI",
    description: "User Interface Design, Prototyping, and Evaluation.",
    status: "completed",
    parent: "cse332",
  },
  {
    id: "cse473",
    label: "CSE 473",
    fullTitle: "Artificial Intelligence",
    description: "Intelligent agents, search, gaming, and learning.",
    status: "completed",
    parent: "cse332", // ✅ Picked primary parent (removed cse312 for cleaner tree)
  },
  {
    id: "cse394",
    label: "CSE 394",
    fullTitle: "Introduction to Research in Computer Science and Engineering",
    description: "Intelligent agents, search, gaming, and learning.",
    status: "completed",
  },
  {
    id: "cse494",
    label: "CSE 494",
    fullTitle: "Guided Research in Computer Science and Engineering",
    description: "Intelligent agents, search, gaming, and learning.",
    status: "in-progress",
    parent: "cse394",
  },
];

export default treeData;