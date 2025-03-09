<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePendingPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the user is president of the club
        $club = $this->user()->clubs()
            ->wherePivot('club_id', $this->input('club_id'))
            ->wherePivot('role', 'president')
            ->first();

        return $club !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'club_id' => 'required|exists:clubs,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'club_id.required' => 'The club ID is required.',
            'club_id.exists' => 'The selected club does not exist.',
            'title.required' => 'The post title is required.',
            'title.max' => 'The post title cannot be longer than 255 characters.',
            'content.required' => 'The post content is required.'
        ];
    }
}
