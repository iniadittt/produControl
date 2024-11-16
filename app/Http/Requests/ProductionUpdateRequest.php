<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductionUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'min:1', 'max:20'],
            'product_name' => ['required', 'string', 'min:1', 'max:50'],
            'quantity' => ['required', 'integer', 'min:1'],
            'category_id' => ['required', 'integer', 'min:1'],
            'tags' => ['required', 'array', 'min:1'],
        ];
    }
}
