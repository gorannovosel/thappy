CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category VARCHAR(50) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category_published ON articles(category, is_published);

-- Create updated_at trigger for articles table
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample educational articles
INSERT INTO articles (id, title, content, author, category, slug, is_published, published_date) VALUES
('understanding-anxiety', 'Understanding Anxiety: A Guide to Mental Health',
'Anxiety is one of the most common mental health conditions, affecting millions of people worldwide. It''s characterized by feelings of worry, fear, or unease that can be mild or severe. Understanding anxiety is the first step toward managing it effectively.

What is Anxiety?
Anxiety is a natural response to stress or danger. When we perceive a threat, our body''s "fight-or-flight" response is triggered, releasing hormones like adrenaline and cortisol. This response helped our ancestors survive dangerous situations, but in modern life, it can be triggered by non-life-threatening situations.

Types of Anxiety Disorders:
1. Generalized Anxiety Disorder (GAD) - Persistent worry about everyday situations
2. Panic Disorder - Sudden episodes of intense fear
3. Social Anxiety Disorder - Fear of social situations
4. Phobias - Intense fear of specific objects or situations
5. Obsessive-Compulsive Disorder (OCD) - Repetitive thoughts and behaviors

Symptoms of Anxiety:
Physical symptoms may include rapid heartbeat, sweating, trembling, shortness of breath, and muscle tension. Emotional symptoms can include excessive worry, restlessness, irritability, and difficulty concentrating.

When to Seek Help:
If anxiety interferes with your daily life, work, relationships, or overall well-being, it''s time to seek professional help. A mental health professional can provide proper diagnosis and treatment options.

Treatment Options:
- Cognitive Behavioral Therapy (CBT)
- Exposure therapy
- Medication when appropriate
- Mindfulness and relaxation techniques
- Regular exercise and healthy lifestyle changes

Remember, anxiety is treatable, and with the right support and strategies, you can learn to manage your symptoms effectively.',
'Dr. Ana Marić', 'anxiety', 'understanding-anxiety', true, NOW() - INTERVAL '7 days'),

('managing-depression', 'Managing Depression: Steps Toward Recovery',
'Depression is more than just feeling sad or going through a rough patch. It''s a serious mental health condition that affects how you feel, think, and handle daily activities. Understanding depression and learning management strategies is crucial for recovery.

What is Depression?
Depression, also known as major depressive disorder, is a medical condition that causes persistent feelings of sadness, hopelessness, and loss of interest in activities. It affects millions of people and can occur at any age.

Common Symptoms:
- Persistent sad, anxious, or empty mood
- Loss of interest in activities once enjoyed
- Significant weight loss or gain
- Sleep disturbances (insomnia or oversleeping)
- Fatigue or loss of energy
- Feelings of worthlessness or guilt
- Difficulty concentrating
- Thoughts of death or suicide

Types of Depression:
1. Major Depressive Disorder - The most common form
2. Persistent Depressive Disorder - Long-term depression
3. Seasonal Affective Disorder - Depression related to seasons
4. Postpartum Depression - Depression after childbirth
5. Bipolar Disorder - Depression alternating with mania

Self-Care Strategies:
- Maintain a regular sleep schedule
- Exercise regularly, even light walking helps
- Eat a balanced diet
- Stay connected with supportive people
- Practice mindfulness and meditation
- Set realistic goals and celebrate small achievements
- Limit alcohol and avoid drugs

Professional Treatment:
Professional help is often necessary for depression. Treatment may include psychotherapy, medication, or a combination of both. Cognitive Behavioral Therapy (CBT) and Interpersonal Therapy (IPT) have shown particular effectiveness.

Building a Support Network:
Recovery is easier with support. Reach out to family, friends, support groups, or mental health professionals. You don''t have to face depression alone.

Remember: Depression is not a sign of weakness, and it''s not something you can just "snap out of." It''s a real medical condition that requires proper treatment and support.',
'Dr. Marko Petrović', 'depression', 'managing-depression', true, NOW() - INTERVAL '5 days'),

('healthy-relationships', 'Building Healthy Relationships: Communication and Boundaries',
'Healthy relationships are fundamental to our well-being and happiness. Whether romantic, familial, or friendships, the quality of our relationships significantly impacts our mental health and overall life satisfaction.

Characteristics of Healthy Relationships:
- Mutual respect and trust
- Open and honest communication
- Support for individual growth
- Shared values and goals
- Healthy conflict resolution
- Emotional and physical safety
- Maintaining individual identity

Effective Communication:
Good communication is the foundation of any healthy relationship. This includes:

Active Listening: Give your full attention when others speak. Ask clarifying questions and reflect back what you''ve heard to ensure understanding.

Express Yourself Clearly: Use "I" statements to express your feelings without blaming. For example, "I feel hurt when..." rather than "You always..."

Nonverbal Communication: Pay attention to body language, tone of voice, and facial expressions, both your own and others''.

Setting Healthy Boundaries:
Boundaries are guidelines that define how you want to be treated and what you''re comfortable with. They''re essential for maintaining your well-being and the health of your relationships.

Types of Boundaries:
- Physical boundaries (personal space, touch)
- Emotional boundaries (sharing feelings, taking on others'' emotions)
- Mental boundaries (thoughts, values, opinions)
- Time boundaries (how you spend your time)
- Digital boundaries (social media, technology use)

How to Set Boundaries:
1. Identify your limits and needs
2. Communicate them clearly and directly
3. Be consistent in maintaining them
4. Respect others'' boundaries as well
5. Be prepared for some resistance initially

Conflict Resolution:
Disagreements are normal in any relationship. Healthy conflict resolution involves:
- Staying calm and respectful
- Focusing on the issue, not attacking the person
- Looking for compromise and solutions
- Taking breaks when emotions run high
- Seeking to understand before being understood

Red Flags in Relationships:
- Controlling behavior
- Verbal, emotional, or physical abuse
- Lack of respect for boundaries
- Constant criticism or put-downs
- Isolation from friends and family
- Extreme jealousy or possessiveness

Building Trust:
Trust is earned through consistency, honesty, and reliability. It takes time to build but can be quickly damaged. To build trust:
- Keep your promises
- Be honest, even when it''s difficult
- Admit mistakes and take responsibility
- Show empathy and understanding
- Be reliable and consistent

Remember: Healthy relationships require effort from all parties involved. It''s okay to seek help from a counselor or therapist if you''re struggling with relationship issues.',
'Counselor Jelena Nikolić', 'relationships', 'healthy-relationships', true, NOW() - INTERVAL '3 days'),

('stress-management-techniques', 'Effective Stress Management Techniques',
'Stress is an inevitable part of life, but chronic stress can have serious impacts on both physical and mental health. Learning effective stress management techniques is essential for maintaining overall well-being and preventing burnout.

Understanding Stress:
Stress is your body''s response to any demand or challenge. While some stress can be motivating and helpful, chronic stress can lead to various health problems including anxiety, depression, heart disease, and weakened immune system.

Common Sources of Stress:
- Work pressures and deadlines
- Financial concerns
- Relationship issues
- Health problems
- Major life changes
- Daily hassles and responsibilities

Physical Signs of Stress:
- Headaches and muscle tension
- Fatigue and sleep problems
- Changes in appetite
- Frequent illnesses
- High blood pressure
- Digestive issues

Emotional Signs of Stress:
- Irritability and mood swings
- Anxiety and worry
- Feeling overwhelmed
- Depression and sadness
- Difficulty concentrating
- Low motivation

Effective Stress Management Techniques:

1. Deep Breathing Exercises:
Practice diaphragmatic breathing by inhaling slowly through your nose for 4 counts, holding for 4 counts, and exhaling through your mouth for 6 counts. Repeat several times.

2. Progressive Muscle Relaxation:
Systematically tense and then relax different muscle groups in your body, starting from your toes and working up to your head.

3. Mindfulness and Meditation:
Spend 10-20 minutes daily focusing on the present moment. Use guided meditation apps or simply focus on your breathing.

4. Regular Exercise:
Physical activity releases endorphins, natural mood elevators. Aim for at least 30 minutes of moderate exercise most days of the week.

5. Time Management:
- Prioritize tasks using a to-do list
- Break large projects into smaller, manageable steps
- Learn to say no to non-essential commitments
- Delegate when possible

6. Social Support:
Maintain connections with family and friends. Share your concerns with trusted individuals and don''t hesitate to ask for help when needed.

7. Healthy Lifestyle Choices:
- Get adequate sleep (7-9 hours per night)
- Eat a balanced diet
- Limit caffeine and alcohol
- Avoid smoking and recreational drugs

8. Hobbies and Recreation:
Engage in activities you enjoy, whether it''s reading, gardening, painting, or playing music. Make time for fun and relaxation.

9. Professional Help:
If stress becomes overwhelming or interferes with daily life, consider seeking help from a mental health professional. Therapy can provide additional coping strategies and support.

Workplace Stress Management:
- Take regular breaks throughout the day
- Create a comfortable and organized workspace
- Practice good communication with colleagues
- Set realistic goals and expectations
- Use vacation time to recharge

Remember: Stress management is a skill that takes practice. What works for one person may not work for another, so experiment with different techniques to find what works best for you.',
'Dr. Stefan Jovanović', 'stress-management', 'stress-management-techniques', true, NOW() - INTERVAL '2 days'),

('self-care-importance', 'The Importance of Self-Care in Mental Health',
'Self-care isn''t selfish—it''s essential. Taking care of your physical, emotional, and mental well-being is crucial for maintaining good mental health and preventing burnout. In our busy lives, self-care often takes a backseat, but it should be a priority.

What is Self-Care?
Self-care refers to activities and practices that we engage in on a regular basis to reduce stress and maintain our health and well-being. It''s about being kind to yourself and treating yourself with the same compassion you would show a good friend.

Why Self-Care Matters:
- Reduces stress and anxiety
- Improves physical health
- Enhances emotional resilience
- Increases productivity and focus
- Strengthens relationships
- Prevents burnout and depression
- Builds self-esteem and confidence

Types of Self-Care:

Physical Self-Care:
- Regular exercise and movement
- Adequate sleep (7-9 hours per night)
- Nutritious eating habits
- Regular medical check-ups
- Staying hydrated
- Taking relaxing baths or showers
- Getting fresh air and sunlight

Emotional Self-Care:
- Practicing mindfulness and meditation
- Journaling thoughts and feelings
- Setting healthy boundaries
- Expressing emotions in healthy ways
- Seeking therapy or counseling when needed
- Practicing gratitude
- Engaging in activities that bring joy

Mental Self-Care:
- Reading books or articles
- Learning new skills or hobbies
- Solving puzzles or brain games
- Limiting negative media consumption
- Practicing positive self-talk
- Setting realistic goals
- Taking breaks from technology

Social Self-Care:
- Spending time with supportive friends and family
- Joining clubs or groups with shared interests
- Volunteering for causes you care about
- Setting boundaries in relationships
- Asking for help when needed
- Communicating your needs clearly

Spiritual Self-Care:
- Practicing meditation or prayer
- Spending time in nature
- Reflecting on personal values
- Engaging in community service
- Practicing forgiveness
- Exploring meaning and purpose in life

Creating a Self-Care Routine:
1. Assess your current needs and stress levels
2. Identify activities that make you feel refreshed and renewed
3. Start small with 10-15 minutes daily
4. Schedule self-care activities like any other important appointment
5. Be flexible and adjust as needed
6. Track your mood and energy levels

Common Self-Care Barriers:
- Feeling guilty or selfish
- Believing you don''t have time
- Thinking self-care is expensive
- Not knowing where to start
- Perfectionist thinking

Overcoming These Barriers:
- Remember that self-care enables you to better care for others
- Start with just 5 minutes a day
- Many self-care activities are free (walking, breathing exercises)
- Begin with one small activity
- Progress, not perfection, is the goal

Self-Care on a Budget:
- Take a warm bath with Epsom salts
- Go for a walk in nature
- Practice deep breathing exercises
- Listen to free meditation apps
- Call a supportive friend
- Write in a journal
- Do stretching or yoga at home

Remember: Self-care looks different for everyone. What matters is finding activities that help you feel refreshed, restored, and ready to handle life''s challenges. Make self-care a non-negotiable part of your routine.',
'Therapist Milica Stojanović', 'self-care', 'self-care-importance', true, NOW() - INTERVAL '1 day'),

('mindfulness-mental-health', 'Mindfulness and Its Role in Mental Health',
'Mindfulness, the practice of being fully present and engaged in the current moment, has gained significant recognition in mental health treatment. This ancient practice, rooted in Buddhist tradition, has been scientifically proven to offer numerous mental health benefits.

What is Mindfulness?
Mindfulness is the basic human ability to be fully present, aware of where we are and what we''re doing, and not overly reactive or overwhelmed by what''s happening around us. It involves paying attention to thoughts, feelings, bodily sensations, and the surrounding environment with openness and without judgment.

Core Components of Mindfulness:
- Attention: Focusing on the present moment
- Awareness: Noticing thoughts, feelings, and sensations
- Acceptance: Observing without judgment
- Non-attachment: Not getting caught up in thoughts or emotions

Mental Health Benefits:
Research has shown that regular mindfulness practice can:
- Reduce anxiety and depression symptoms
- Lower stress levels and cortisol production
- Improve emotional regulation
- Enhance focus and concentration
- Increase self-awareness and insight
- Reduce rumination and negative thought patterns
- Improve sleep quality
- Boost immune system function

Mindfulness Techniques:

1. Mindful Breathing:
Focus your attention on your breath. Notice the sensation of air entering and leaving your body. When your mind wanders, gently bring attention back to your breath.

2. Body Scan Meditation:
Systematically focus on different parts of your body, starting from your toes and moving up to your head. Notice any sensations without trying to change them.

3. Mindful Walking:
Pay attention to the sensation of walking—the feeling of your feet touching the ground, the movement of your legs, and your surroundings.

4. Loving-Kindness Meditation:
Direct feelings of love and kindness toward yourself, loved ones, neutral people, difficult people, and all beings.

5. Mindful Eating:
Pay full attention to the experience of eating—the taste, texture, smell, and appearance of food. Eat slowly and savor each bite.

Incorporating Mindfulness into Daily Life:
- Start your day with 5 minutes of mindful breathing
- Practice mindful listening during conversations
- Take mindful breaks throughout the workday
- Use mindfulness apps for guided meditations
- Practice gratitude by mindfully appreciating three things daily
- Engage in routine activities mindfully (brushing teeth, washing dishes)

Mindfulness-Based Therapies:
Several therapeutic approaches incorporate mindfulness:
- Mindfulness-Based Stress Reduction (MBSR)
- Mindfulness-Based Cognitive Therapy (MBCT)
- Dialectical Behavior Therapy (DBT)
- Acceptance and Commitment Therapy (ACT)

Common Misconceptions:
- Mindfulness is not about emptying your mind
- It''s not a religion (though it has spiritual roots)
- It doesn''t require hours of meditation
- It''s not about relaxation (though that may be a side effect)
- It''s not about positive thinking or avoiding negative emotions

Getting Started:
1. Begin with just 5 minutes daily
2. Use guided meditations initially
3. Be patient and kind with yourself
4. Consistency is more important than duration
5. Notice without judging your experience
6. Join a mindfulness group or class for support

Challenges and How to Overcome Them:
- Mind wandering: This is normal—gently return focus to the present
- Physical discomfort: Adjust your position as needed
- Emotional intensity: Allow feelings to arise without resistance
- Lack of time: Remember that even one mindful breath counts
- Skepticism: Approach with curious openness rather than judgment

Remember: Mindfulness is a practice, not a perfect state. The goal isn''t to achieve a particular state of mind but to develop a different relationship with your thoughts and emotions. With regular practice, mindfulness can become a powerful tool for maintaining mental health and well-being.',
'Dr. Aleksandar Popović', 'mindfulness', 'mindfulness-mental-health', true, NOW());