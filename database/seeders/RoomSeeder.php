<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Conference Room A',
                'description' => 'Large conference room with projector and whiteboard',
                'capacity' => 30,
                'location' => 'Main Building, 1st Floor',
                'is_available' => true
            ],
            [
                'name' => 'Seminar Room 101',
                'description' => 'Medium-sized seminar room perfect for workshops',
                'capacity' => 20,
                'location' => 'Academic Block, 2nd Floor',
                'is_available' => true
            ],
            [
                'name' => 'Meeting Room B',
                'description' => 'Small meeting room for group discussions',
                'capacity' => 8,
                'location' => 'Student Center, Ground Floor',
                'is_available' => true
            ],
            [
                'name' => 'Auditorium',
                'description' => 'Large auditorium with stage and sound system',
                'capacity' => 150,
                'location' => 'Arts Building, Basement',
                'is_available' => true
            ],
            [
                'name' => 'Computer Lab 3',
                'description' => 'Computer lab with 25 workstations',
                'capacity' => 25,
                'location' => 'Technology Building, 3rd Floor',
                'is_available' => true
            ],
            [
                'name' => 'Study Room 201',
                'description' => 'Quiet study room with tables and power outlets',
                'capacity' => 12,
                'location' => 'Library, 2nd Floor',
                'is_available' => true
            ],
            [
                'name' => 'Dance Studio',
                'description' => 'Spacious studio with mirrors and sound system',
                'capacity' => 20,
                'location' => 'Recreation Center, 1st Floor',
                'is_available' => true
            ],
            [
                'name' => 'Student Lounge',
                'description' => 'Casual meeting space with couches and coffee tables',
                'capacity' => 35,
                'location' => 'Student Center, 2nd Floor',
                'is_available' => true
            ]
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
} 