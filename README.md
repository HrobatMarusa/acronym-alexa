# Acronym Bot :abc:

An alexa skill that lets the user discover the meaning of commonly used acronyms within BBC R&amp;D.

<h3>Example phrases</h3>

<ul> 
  <li>"Alexa, open acronym bot"</li>
  <li>"What does the acronym BBC stand for?"</li>
  <li>"What does the acronym R&D mean?"</li>
  <li>"Tell me the meaning of the acronym HCI"</li>
  <li>"Repeat that"</li>
  <li>"Goodbye"</li>
</ul>

<h3>Technical Structure</h3>

This skill is supported by the B.R.A.D. (BBC R&D Acronym Database) database, which currently holds information about more than 450 acronyms commonly used within BBC R&D. The acronym bot reads a DynamoDB backend based on the acronym (i.e. primary key) requested by the user and responds with the available information, including the definition and description. 

<h3>Points of interest / learnings </h3>

<ul>
  <li> The basics of AWS and Alexa skill development.</li>
  <li> Using Python to retrieve csv data from Amazon S3 and populate a DynamoDB table.</li>
  <li> Using async/await calls for database access. </li>
  <li> Interfacing nodeJS on AWS lambda with a dynamoDB backend.</li>
  <li> Using git. </li>
</ul>
