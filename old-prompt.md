Craft a multiple-choice questionnaire (10 questions) for a university student based on the Provided Summarised Transcript.
Ensure you have ONLY 10 questions.
Do not make references to the transcript or the lecture, the quiz should be clear and concise.
Do not ask questions on whether the topic was covered or not in the lecture.
Build 5 easy, 3 medium, and 2 hard questions.
The questionnaire should be in the ISO 639-2 Code: EN
The text below is a summarised transcript of the lecture that the teacher provided today
The answer choices must be around the topics covered in the lecture.
The question must be focused the topics covered in the lecture and not on general topics around the subject.
Test the examinee's understanding of essential concepts mentioned in the transcript.
Follow these guidelines:
Ensure that only one answer is correct.

Formulate a question that probes knowledge of the Core Concepts.
Present four answer choices labeled as 1, 2, 3, and 4.
Indicate the correct answer labeled as 'answer'.
Articulate a reasoned and concise defense for your chosen answer without relying on direct references to the text labeled as \"explanation\"

Structure your response in this format and do not include any additional text, respond with the XML content only. The response must be valid XML following this format:

```xml
<response>
    <questions>
        <title>[Brief question title]</title>
        <question>
            [Question]
        </question>
        <answers>[Option 1]</answers>
        <answers>[Option 2]</answers>
        <answers>[Option 3]</answers>
        <answers>[Option 4]</answers>
        <correctAnswer>[Correct Answer Number]</correctAnswer>
        <explanation>[Explanation for Correctness]</explanation>
    </questions>
    <!-- all other questions below   -->
</response>
```

    Provided Summarised Transcript:

The key topics covered in the lecture are:

1. Introduction to the C programming language:

   - Comparing C to Scratch, noting the increased complexity but similar underlying concepts
   - Explanation of source code, compilers, and the need to convert code to machine code

2. Basic C syntax and concepts:

   - Variables, data types (int, char, float, etc.)
   - Printf for output, including format specifiers
   - Conditionals (if-else) and logical operators

3. Functions in C:

   - Defining and calling custom functions
   - Passing arguments to functions
   - Return values from functions

4. Loops in C:

   - While loops
   - For loops
   - Do-while loops

5. Command-line interface and file management:

   - Navigating the terminal and using common commands (ls, mv, rm, etc.)
   - Editing and compiling code in the VS Code environment

6. Limitations of computers and data representation:
   - Integer overflow
   - Floating-point imprecision
   - Historical examples of software bugs due to these limitations

The lecture focused on translating concepts from Scratch to the C programming language, building up from simple \"Hello, world\" programs to more complex control flow and problem-solving using functions and loops. It also highlighted some fundamental limitations of computer hardware and software when dealing with data representation.
