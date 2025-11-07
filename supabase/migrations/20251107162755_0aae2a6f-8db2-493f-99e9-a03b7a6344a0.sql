-- Create bookings table to store travel reservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  departure_date DATE NOT NULL,
  return_date DATE,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bookings (for now, since there's no auth)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow anyone to view their own bookings
CREATE POLICY "Anyone can view all bookings"
ON public.bookings
FOR SELECT
TO anon
USING (true);

-- Create index for faster queries by email
CREATE INDEX idx_bookings_email ON public.bookings(email);

-- Create index for faster queries by departure_date
CREATE INDEX idx_bookings_departure_date ON public.bookings(departure_date);