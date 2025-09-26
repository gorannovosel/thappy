-- Remove sample therapy data

DELETE FROM therapies WHERE id IN (
    'cognitive-behavioral-therapy',
    'psychodynamic-therapy',
    'humanistic-therapy',
    'family-therapy',
    'dialectical-behavior-therapy',
    'acceptance-commitment-therapy',
    'emdr-therapy',
    'gestalt-therapy',
    'narrative-therapy',
    'somatic-therapy',
    'solution-focused-therapy',
    'mindfulness-based-therapy'
);