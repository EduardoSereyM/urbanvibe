-- Migration 013: Add friendships table
CREATE TABLE public.friendships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    friend_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text])),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT friendships_pkey PRIMARY KEY (id),
    CONSTRAINT friendships_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT friendships_friend_fkey FOREIGN KEY (friend_id) REFERENCES public.profiles(id),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Index for faster queries
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
